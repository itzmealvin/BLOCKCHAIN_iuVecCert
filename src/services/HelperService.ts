class HelperService {
    truncateString = (str: string, num: number) => {
        if (str.length <= num * 2) {
            return str;
        }
        return str.slice(0, num) + "..." + str.slice(-num);
    };
}

export default new HelperService();