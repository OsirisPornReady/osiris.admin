/**
 * 比较日期大小
 *
 * @param date1 左日期
 * @param date2 右日期
 */
export function dateCompare(date1: Date, date2: Date): number {
  if (date1.getFullYear() == date2.getFullYear()) {
    if (date1.getMonth() == date2.getMonth()){
      if (date1.getDate() == date2.getDate()) {
        return 0;
      } else if (date1.getDate() > date2.getDate()) {
        return 1;
      } else if (date1.getDate() < date2.getDate()) {
        return -1;
      } else { return 404; }
    } else if (date1.getMonth() > date2.getMonth()) {
      return 1;
    } else if (date1.getMonth() < date2.getMonth()) {
      return -1;
    } else { return 404; }
  } else if (date1.getFullYear() > date2.getFullYear()) {
    return 1;
  } else if (date1.getFullYear() > date2.getFullYear()) {
    return -1;
  } else { return 404; }
}
