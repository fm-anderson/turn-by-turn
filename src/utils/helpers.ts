export const getTurnByTurnMapsUrl = (originalUrl: string): string => {
  const dataIndex = originalUrl.indexOf("/data=");

  if (dataIndex !== -1) {
    return (
      originalUrl.substring(0, dataIndex) +
      "/am=t" +
      originalUrl.substring(dataIndex)
    );
  }
  return originalUrl + "/am=t";
};

export const cleanAddress = (address: string): string => {
  let cleaned = address.trim();

  cleaned = cleaned.replace(/, USA$/, "");

  const parts = cleaned.split(",").map((part) => part.trim());

  let city = "";
  let state = "";

  const stateRegex = /^[A-Z]{2}$/;

  for (let i = parts.length - 1; i >= 0; i--) {
    const currentPart = parts[i];
    if (stateRegex.test(currentPart)) {
      state = currentPart;
      if (i > 0) {
        city = parts[i - 1];
      }
      break;
    } else if (currentPart.match(/^[A-Z]{2}\s\d{5}(-\d{4})?$/)) {
      const stateZipParts = currentPart.split(" ");
      if (stateZipParts.length > 0 && stateRegex.test(stateZipParts[0])) {
        state = stateZipParts[0];
        if (i > 0) {
          city = parts[i - 1];
        }
        break;
      }
    }
  }

  if (city && state) {
    return `${city}, ${state}`;
  }

  const relevantParts = parts.filter((p) => !p.match(/^\d+$/));

  if (relevantParts.length >= 2) {
    return `${relevantParts[relevantParts.length - 2]}, ${relevantParts[relevantParts.length - 1]}`;
  } else if (relevantParts.length === 1) {
    return relevantParts[0];
  }

  return cleaned;
};
