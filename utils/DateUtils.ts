

export function getTodayString()  {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export function formattedDate(dateStr:String) {
    console.log('dateStr:'+dateStr)
    if (!dateStr || dateStr.length !== 8) return '';
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
}

export function formattedDate2(dateStr:String): string {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS Date는 0부터 시작
    const day = parseInt(dateStr.substring(6, 8), 10);

    const date = new Date(year, month, day);

    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dayOfWeek = dayNames[date.getDay()];

    return `${year}/${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}\n(${dayOfWeek})`;
}
