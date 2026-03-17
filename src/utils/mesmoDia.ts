export function mesmoDia(data1: Date, data2: Date) {
  return (
    data1.getFullYear() === data2.getFullYear() &&
    data1.getMonth() === data2.getMonth() &&
    data1.getDate() === data2.getDate()
  );
}