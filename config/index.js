module.exports = {
    build: {
        env: require('./prod.env'),
        DisableF12: true
    },
    dev: {
        env: require('./dev.env'),
        removeElectronJunk: true
    },
    UseStartupChart: true,
    IsUseSysTitle: true
}
