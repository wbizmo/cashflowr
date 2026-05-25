export const supportedCurrencies = ["USD", "GBP", "EUR", "NGN"];

export const formatMoney = (amount = 0, currency = "USD") => {
  const safeCurrency = supportedCurrencies.includes(currency)
    ? currency
    : "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${amount}`;
  }
};