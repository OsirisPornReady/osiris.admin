export function setL(index: string, value: any): void {
  localStorage.setItem(index, JSON.stringify(value));
}

export function getL(index: string): any {
  if (localStorage.getItem(index)) {
    return JSON.parse(localStorage.getItem(index)!);
  } else {
    return null;
  }
}
