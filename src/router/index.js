import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { // 首页
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/home/Home.vue'),
    meta: {
      keepAlive: true // 需要缓存
    }
  },
  { // 分类
    path: '/classify',
    name: 'Classify',
    component: () => import(/* webpackChunkName: "classify" */ '../views/classify/Classify.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 新建笔记
    path: '/createNote',
    name: 'CreateNote',
    component: () => import(/* webpackChunkName: "createNote" */ '../views/post/CreateNote.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 消息
    path: '/message',
    name: 'Message',
    component: () => import(/* webpackChunkName: "message" */ '../views/message/Message.vue'),
    meta: {
      keepAlive: true // 需要缓存
    }
  },
  { // 私信
    path: '/chat/:userId',
    name: 'Chat',
    component: () => import(/* webpackChunkName: "chat" */ '../views/message/Chat.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 注册登录
    path: '/registerAndLogin',
    name: 'RegisterAndLogin',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "registerAndLogin" */ '../views/registerAndLogin/RegisterAndLogin.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 重置密码
    path: '/resetPass',
    name: 'ResetPass',
    component: () => import(/* webpackChunkName: "resetPass" */ '../views/registerAndLogin/ResetPass.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 搜索
    path: '/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "search" */ '../views/search/Search.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 笔记详情
    path: '/noteDetail/:noteId',
    name: 'NoteDetail',
    component: () => import(/* webpackChunkName: "noteDetail" */ '../views/noteDetail/NoteDetail.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 我的
    path: '/my',
    name: 'My',
    component: () => import(/* webpackChunkName: "my" */ '../views/my/My.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 用户资料
    path: '/user/:userId',
    name: 'UserInfo',
    component: () => import(/* webpackChunkName: "userInfo" */ '../views/user/UserInfo.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  },
  { // 编辑用户资料
    path: '/editInfo',
    name: 'EditInfo',
    component: () => import(/* webpackChunkName: "editInfo" */ '../views/user/EditInfo.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
