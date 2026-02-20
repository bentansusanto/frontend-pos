export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export const setCookie = (name: string, value: string, options: { expires?: number } = {}) => {
  let cookieString = `${name}=${value}; path=/`;
  if (options.expires) {
    const date = new Date();
    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }
  document.cookie = cookieString;
};

export const removeCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
};
