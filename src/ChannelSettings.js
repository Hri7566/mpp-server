const config = require("../config");

class ChannelSettings {
    static allowedProperties = {
        color: {
            type: "color",
            default: config.defaultChannelSettings.color,
            allowedChange: true,
            required: true
        },
        color2: {
            type: "color2",
            default: config.defaultChannelSettings.color2,
            allowedChange: true,
            required: false
        },
        lobby: {
            type: "boolean",
            allowedChange: false,
            required: false
        },
        visible: {
            type: "boolean",
            default: true,
            allowedChange: true,
            required: true
        },
        chat: {
            type: "boolean",
            default: true,
            allowedChange: true,
            required: true
        },
        owner_id: {
            type: "string",
            allowedChange: false,
            required: false
        },
        crownsolo: {
            type: "boolean",
            default: false,
            allowedChange: true,
            required: true
        },
        "no cussing": {
            type: "boolean",
            allowedChange: true,
            required: false
        },
        "lyrical notes": {
            type: "boolean",
            allowedChange: false,
            required: false
        }
    };

    constructor(set, context) {
        Object.keys(ChannelSettings.allowedProperties).forEach(key => {
            if (
                typeof ChannelSettings.allowedProperties[key].default !==
                "undefined"
            ) {
                if (
                    this[key] !== ChannelSettings.allowedProperties[key].default
                ) {
                    this[key] = ChannelSettings.allowedProperties[key].default;
                }
            }
        });

        Object.keys(ChannelSettings.allowedProperties).forEach(key => {
            if (ChannelSettings.allowedProperties[key].required == true) {
                if (typeof this[key] == "undefined") {
                    this[key] = ChannelSettings.allowedProperties[key].default;
                }
            }
        });

        if (typeof set !== "undefined") {
            Object.keys(set).forEach(key => {
                if (typeof set[key] == "undefined") return;
                if (
                    Object.keys(ChannelSettings.allowedProperties).indexOf(
                        key
                    ) !== -1
                ) {
                    if (typeof context == "undefined") {
                        this[key] = this.verifyPropertyType(
                            key,
                            set[key],
                            ChannelSettings.allowedProperties[key].type
                        );
                    } else {
                        if (context == "user") {
                            if (
                                ChannelSettings.allowedProperties[key]
                                    .allowedChange
                            ) {
                                this[key] = this.verifyPropertyType(
                                    key,
                                    set[key],
                                    ChannelSettings.allowedProperties[key].type
                                );
                            }
                        }
                    }
                }
            });
        }
    }

    verifyPropertyType(key, pr, type) {
        let ret;

        if (typeof ChannelSettings.allowedProperties[key] !== "object") return;

        switch (type) {
            case "color":
                if (/^#[0-9a-f]{6}$/i.test(pr)) {
                    ret = pr;
                } else {
                    ret = ChannelSettings.allowedProperties[key].default;
                }
                break;
            case "color2":
                if (/^#[0-9a-f]{6}$/i.test(pr)) {
                    ret = pr;
                } else {
                    ret = ChannelSettings.allowedProperties[key].default;
                }
                break;
            default:
                if (typeof pr == type) {
                    ret = pr;
                } else if (
                    typeof ChannelSettings.allowedProperties[key].default !==
                    "undefined"
                ) {
                    ret = ChannelSettings.allowedProperties[key].default;
                } else {
                    ret = undefined;
                }
                break;
        }

        return ret;
    }

    changeSettings(set) {
        Object.keys(set).forEach(key => {
            if (ChannelSettings.allowedProperties[key].allowedChange) {
                this[key] = this.verifyPropertyType(
                    key,
                    set[key],
                    ChannelSettings.allowedProperties[key].type
                );
            }
        });
    }

    static changeSettings(set, admin) {
        Object.keys(set).forEach(key => {
            if (
                ChannelSettings.allowedProperties[key].allowedChange ||
                admin == true
            ) {
                set[key] = ChannelSettings.verifyPropertyType(
                    key,
                    set[key],
                    ChannelSettings.allowedProperties[key].type
                );
            }
        });
        return set;
    }

    static verifyPropertyType(key, pr, type) {
        let ret;

        if (typeof ChannelSettings.allowedProperties[key] !== "object") return;

        switch (type) {
            case "color":
                if (/^#[0-9a-f]{6}$/i.test(pr)) {
                    ret = pr;
                } else {
                    ret = ChannelSettings.allowedProperties[key].default;
                }
                break;
            case "color2":
                if (/^#[0-9a-f]{6}$/i.test(pr)) {
                    ret = pr;
                } else {
                    ret = ChannelSettings.allowedProperties[key].default;
                }
                break;
            default:
                if (typeof pr == type) {
                    ret = pr;
                } else if (
                    typeof ChannelSettings.allowedProperties[key].default !==
                    "undefined"
                ) {
                    ret = ChannelSettings.allowedProperties[key].default;
                } else {
                    ret = undefined;
                }
                break;
        }

        return ret;
    }
}

module.exports = ChannelSettings;
