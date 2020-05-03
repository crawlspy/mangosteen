import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const content = () => import('../page/content')
const about = () => import('../page/config/about')
const suggestion = () => import('../page/config/suggestion')
const base = () => import('../page/config/base')
const source = () => import('../page/config/source')
const config = () => import('../page/config')

export default new Router({
  routes: [
    {
      path: '/',
      component: content
    },
    {
      path: '/config',
      component: config,
      redirect: '/config/base',
      children: [
        {
          path: '/config/base',
          component: base
        },
        {
          path: '/config/source',
          component: source
        },
        {
          path: '/config/suggestion',
          component: suggestion
        },
        {
          path: '/config/about',
          component: about
        }
      ]
    }
  ]
})
