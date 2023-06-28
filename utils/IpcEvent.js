module.exports = class IpcEvent {
    /**
     * @param {string} name 事件名稱
     */
    constructor(name) {
        /**
         * @type {string} 事件名稱
         */
        this.name = name;
        
        /**
         * @type {object} 事件的各種細項類型
         */
        this.types = {};
    }

    register = (type, callback) => {
        this.types[type] = callback;
        return this;
    }

    handleEvent = (_event, _data) => {
        const {
            type,
            data
        } = _data;
        this.types[type](_event, data);
    }
}