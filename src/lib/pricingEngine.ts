import { Itinerary, ItineraryDay, ItineraryItem, ItineraryPricing, RateBasis } from '../types';

export function calculateItemCost(
  item: ItineraryItem,
  adults: number,
  children: number,
  infants: number,
  roomsCount: number
): number {
  const paxCount = adults + children;
  const unit = item.unitCost || 0;
  const qty = item.quantity || 1;

  switch (item.rateBasis) {
    case 'per_person':
      return unit * paxCount * qty;
    case 'per_adult':
      return unit * adults * qty;
    case 'per_child':
      return unit * children * qty;
    case 'per_infant':
      return unit * infants * qty;
    case 'per_room_night':
      return unit * roomsCount * qty;
    case 'per_vehicle':
    case 'per_group':
    case 'fixed':
    default:
      return unit * qty;
  }
}

export function recalculateItineraryPricing(
  days: ItineraryDay[],
  adults: number,
  children: number,
  infants: number,
  roomsCount: number,
  currentPricing: ItineraryPricing,
  approvalDiscountThreshold = 10,
  approvalMarginThreshold = 15
): { pricing: ItineraryPricing; requiresApproval: boolean; approvalReason?: string } {
  // Sum cost for all non-optional items across all days
  let totalCost = 0;

  days.forEach((day) => {
    day.items.forEach((item) => {
      // Recalculate each item's total cost
      item.totalCost = calculateItemCost(item, adults, children, infants, roomsCount);
      if (!item.isOptional) {
        totalCost += item.totalCost;
      }
    });
  });

  const exchangeRate = currentPricing.exchangeRate || 1;
  const costInSellingCurrency = totalCost * exchangeRate;

  let sellingPriceBeforeDiscount = costInSellingCurrency;
  let markupValue = currentPricing.markupValue || 0;

  if (currentPricing.markupType === 'percentage') {
    sellingPriceBeforeDiscount = costInSellingCurrency * (1 + markupValue / 100);
  } else {
    sellingPriceBeforeDiscount = costInSellingCurrency + markupValue;
  }

  // Calculate discount
  let discountAmount = 0;
  if (currentPricing.discountType === 'percentage') {
    discountAmount = (sellingPriceBeforeDiscount * (currentPricing.discountValue || 0)) / 100;
  } else {
    discountAmount = currentPricing.discountValue || 0;
  }

  const discountPercent = sellingPriceBeforeDiscount > 0 
    ? (discountAmount / sellingPriceBeforeDiscount) * 100 
    : 0;

  const subtotalAfterDiscount = Math.max(0, sellingPriceBeforeDiscount - discountAmount);

  // Tax calculation
  let taxAmount = 0;
  const taxRate = currentPricing.taxRatePercent || 0;
  if (taxRate > 0) {
    if (currentPricing.taxInclusive) {
      taxAmount = subtotalAfterDiscount - subtotalAfterDiscount / (1 + taxRate / 100);
    } else {
      taxAmount = (subtotalAfterDiscount * taxRate) / 100;
    }
  }

  const finalSellingPrice = currentPricing.taxInclusive
    ? subtotalAfterDiscount
    : subtotalAfterDiscount + taxAmount;

  const grossProfit = finalSellingPrice - taxAmount - costInSellingCurrency;
  const grossMarginPercent = finalSellingPrice > 0 ? (grossProfit / finalSellingPrice) * 100 : 0;
  const calculatedMarkupPercent = costInSellingCurrency > 0 ? (grossProfit / costInSellingCurrency) * 100 : 0;

  // Per-person distribution
  const totalPayablePax = adults + children * 0.75 + infants * 0.1; // proportional split factor
  const perAdultPrice = adults > 0 ? Math.round((finalSellingPrice * (adults / (totalPayablePax || 1))) / adults) : 0;
  const perChildPrice = children > 0 ? Math.round((finalSellingPrice * ((children * 0.75) / (totalPayablePax || 1))) / children) : 0;
  const perInfantPrice = infants > 0 ? Math.round((finalSellingPrice * ((infants * 0.1) / (totalPayablePax || 1))) / infants) : 0;
  const totalPax = adults + children + infants;
  const perPersonAveragePrice = totalPax > 0 ? Math.round(finalSellingPrice / totalPax) : 0;

  // Approval rules check
  let requiresApproval = false;
  let approvalReason = '';

  if (discountPercent > approvalDiscountThreshold) {
    requiresApproval = true;
    approvalReason = `Applied discount (${discountPercent.toFixed(1)}%) exceeds maximum consultant threshold (${approvalDiscountThreshold}%).`;
  } else if (grossMarginPercent < approvalMarginThreshold) {
    requiresApproval = true;
    approvalReason = `Gross margin (${grossMarginPercent.toFixed(1)}%) falls below company policy minimum (${approvalMarginThreshold}%).`;
  }

  const updatedPricing: ItineraryPricing = {
    ...currentPricing,
    totalCost,
    grossProfit,
    subtotalSellingPrice: sellingPriceBeforeDiscount,
    discountAmount,
    taxAmount,
    finalSellingPrice: Math.round(finalSellingPrice * 100) / 100,
    targetMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    markupValue: currentPricing.markupType === 'percentage' ? markupValue : Math.round(calculatedMarkupPercent * 10) / 10,
    perAdultPrice,
    perChildPrice,
    perInfantPrice,
    perPersonAveragePrice,
  };

  return { pricing: updatedPricing, requiresApproval, approvalReason };
}

export interface ValidationAlert {
  type: 'error' | 'warning' | 'info';
  dayNumber?: number;
  message: string;
}

export function validateItinerary(itinerary: Itinerary): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];

  if (!itinerary.startDate || !itinerary.endDate) {
    alerts.push({ type: 'error', message: 'Itinerary is missing valid start or end dates.' });
  }

  if (itinerary.days.length === 0) {
    alerts.push({ type: 'error', message: 'No days found in itinerary.' });
    return alerts;
  }

  itinerary.days.forEach((day, index) => {
    // Check if day has hotel
    const hasHotel = day.items.some((item) => item.type === 'hotel');
    const isLastDay = index === itinerary.days.length - 1;

    if (!hasHotel && !isLastDay) {
      alerts.push({
        type: 'warning',
        dayNumber: day.dayNumber,
        message: `Day ${day.dayNumber} (${day.destination || 'Unassigned'}) has no accommodation assigned.`,
      });
    }

    // Check items for missing costs or rates
    day.items.forEach((item) => {
      if (item.unitCost <= 0 && item.type !== 'free_time') {
        alerts.push({
          type: 'warning',
          dayNumber: day.dayNumber,
          message: `Day ${day.dayNumber}: '${item.title}' has ₹0 cost. Please verify rate validity.`,
        });
      }
    });

    // Check for overlapping item times
    const timedItems = day.items
      .filter((i) => i.startTime && i.endTime)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    for (let i = 0; i < timedItems.length - 1; i++) {
      const current = timedItems[i];
      const next = timedItems[i + 1];
      if (current.endTime! > next.startTime!) {
        alerts.push({
          type: 'warning',
          dayNumber: day.dayNumber,
          message: `Day ${day.dayNumber}: Time overlap between '${current.title}' (${current.startTime}-${current.endTime}) and '${next.title}' (${next.startTime}-${next.endTime}).`,
        });
      }
    }
  });

  if (itinerary.pricing.grossProfit < 0) {
    alerts.push({
      type: 'error',
      message: 'Financial warning: Proposal is currently operating at a net negative margin!',
    });
  }

  return alerts;
}
