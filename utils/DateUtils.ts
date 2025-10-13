

export function getTodayYmd()  {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export function getTodayYm()  {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
};


export function dateToYmd(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
};

export function dateToYm(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
}

export function parseYmdString(s: string) {
    const [y, m, d] = s.split('/').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
};

export function formattedDate(dateStr:String) {
    // console.log('dateStr:'+dateStr)
    if (!dateStr || dateStr.length !== 8) return '';
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
}

export function formattedMonth(dateStr:String) {
    // console.log('dateStr:'+dateStr)
    if (!dateStr || dateStr.length !== 6) return '';
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}`;
}

export function ymdToDateWithDay(dateStr:String): string {
    // console.log('target date:'+dateStr);
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS Date는 0부터 시작
    const day = parseInt(dateStr.substring(6, 8), 10);

    const date = new Date(year, month, day);

    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dayOfWeek = dayNames[date.getDay()];

    return `${year}/${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}\n(${dayOfWeek})`;
}

export function ymdToDateWithDayShort(dateStr:String): string {
    // console.log('target date:'+dateStr);
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS Date는 0부터 시작
    const day = parseInt(dateStr.substring(6, 8), 10);

    const date = new Date(year, month, day);

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = dayNames[date.getDay()];

    return `${year}/${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}[${dayOfWeek}]`;
}
