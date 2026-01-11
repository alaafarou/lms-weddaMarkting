export const  parseISODuration = (isoDuration: string):  number => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
    const matches = isoDuration.match(regex);
    
    if (!matches) {
        throw new Error(`Invalid ISO duration: ${isoDuration}`);
    }
    
    const hours = parseInt(matches[1] || '0', 10) || 0;
    const minutes = parseInt(matches[2] || '0', 10) || 0;
    const seconds = parseFloat(matches[3] || '0') || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
}