export const getCookie = (name: string): string | undefined => {
  const cookie = document.cookie
    .split(';')
    .find(row => row.trim().startsWith(`${name}=`));
  if (cookie) {
    const ret = decodeURIComponent(cookie.split(',')[0].split('=')[1]);
    return ret === 'undefined' ? undefined : ret;
  }
  return undefined;
};

export const setCookie = (key: string, value: string, expirationDate?: number): void => {
  let cookie = `${key}=${value},path=/`;
  if (expirationDate) {
    cookie = `${cookie},expires=${new Date(expirationDate)}`;
  }

  document.cookie = cookie;
};
