export const formatDuration = (minutes: number) => {
    // @review use Intl.NumberFormat

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}min`;
};


export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const  getTimeRange = (startDate: string, durationMinutes: number) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return `${formatTime(start)} - ${formatTime(end)}`;
};

export const toISODateTime = (date: string, time: string) => {
    if (!date || !time) return undefined;

    const [hours, minutes] = time.split(':');
    const normalizedTime = `${hours}:${minutes}:00`;

    return `${date}T${normalizedTime}`;
};