export const supportedCurrencies = ["USD", "GBP", "EUR", "NGN"];

export const currencySymbols = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  NGN: "₦",
};

export const formatMoney = (amount = 0, currency = "USD") => {
  const safeCurrency = supportedCurrencies.includes(currency)
    ? currency
    : "USD";

  const symbol = currencySymbols[safeCurrency] || "$";

  const number = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

  return `${symbol}${number}`;
};

export const cleanNotificationMessage = (message = "") => {
  return message.replace(/\s-\s\$[\d,]+(\.\d+)?\.?$/g, ".");
};