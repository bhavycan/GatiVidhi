const isNewWeek = (date1,date2 = new Date())=>{
    const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  return (
    date1.getFullYear() !== date2.getFullYear() ||
    getWeekNumber(date1) !== getWeekNumber(date2)
  );
}

module.exports = isNewWeek;