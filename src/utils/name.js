export const splitName = (fullName = "") => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], middleName: "", lastName: parts[1] };

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

export const joinName = ({ firstName = "", middleName = "", lastName = "" }) =>
  `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, " ").trim();
