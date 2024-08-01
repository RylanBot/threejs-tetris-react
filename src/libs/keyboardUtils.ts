export const simulateKeyPress = (key: string) => {
    return () => {
        const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
        });
        document.dispatchEvent(event);
    };
};