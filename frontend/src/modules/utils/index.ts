export const getCookie = (name: string): string | undefined => {
  const value = document.cookie
    .split(';')
    .find(row => row.trim().startsWith(`${name}=`));

  if (value) {
    return decodeURIComponent(value.split(',')[0].split('=')[1]);
  }

  return undefined;
};

export const setCookie = (name: string, value: string, expiry?: number): void => {
  let cookie = `${name}=${encodeURIComponent(value)},path=/`;
  if (expiry) {
    cookie = `${cookie},expires=${new Date(expiry)}`;
  }

  document.cookie = cookie;
};

export const clearCookie = (name: string): void => {
  document.cookie = `${name}=,expires=${new Date(0)}`;
};
