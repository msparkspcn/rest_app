

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

