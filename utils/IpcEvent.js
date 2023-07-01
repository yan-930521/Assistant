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


        /**
         * @type {object} 處理器的集合
         */
        this.handlers = {};
    }

    register = (type, callback) => {
        this.types[type] = callback;
        return this;
    }

    handler = (type, callback) => {
        this.handlers[type] = callback;
        return this;
    }

    handleEvent = (_this, _event, _data) => {
        const {
            type,
            data
        } = _data;
        return this.types[type](_this, _event, data);
    }

    handleInvoke = (_this, _event, _data) => {
        const {
            type,
            data
        } = _data;
        return this.handlers[type](_this, _event, data);
    }
}