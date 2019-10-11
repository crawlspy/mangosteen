import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err)
}

const content = () => import('../page/content')
const about = () => import('../page/about')
const suggestion = () => import('../page/suggestion')

export default new Router({
    routes: [
        {
            path: '/',
            component: content
        },
        {
            path: '/about',
            component: about
        },
        {
            path: '/suggestion',
            component: suggestion
        },
        
    ]
})
