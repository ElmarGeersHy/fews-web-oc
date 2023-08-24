import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/auth/LoginView.vue'
import Logout from '../views/auth/Logout.vue'
import Silent from '../views/auth/Silent.vue'
import { configManager } from '../services/application-config'
import { authenticationManager } from '../services/authentication/AuthenticationManager'
import { useConfigStore } from '../stores/config.ts'

const Empty = () => import('../views/Empty.vue')

const routesBase: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    redirect: { name: 'About' },
    name: 'Default',
  },
  {
    path: '/about',
    name: 'About',
    meta: { authorize: [] },
    component: AboutView,
  },
  {
    path: '/login',
    name: 'Login',
    meta: { layout: 'empty' },
    component: LoginView,
  },
  {
    path: '/auth/silent',
    meta: { layout: 'empty' },
    component: Silent,
  },
  {
    path: '/auth/logout',
    meta: { layout: 'empty' },
    component: Logout,
  },
]

export const dynamicRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/dataviewer/:filterId?/:categoryId?',
    name: 'DataViewer',
    component: Empty,
    props: (route) => ({ ...route.params, layerName: route.query.layerName }),
    meta: { authorize: [], sidebar: true },
  },
  {
    path: '/ssd/:groupId?/:panelId?',
    name: 'SchematicStatusDisplay',
    component: Empty,
    props: true,
    meta: { authorize: [], sidebar: true },
  },
  {
    path: '/map/:layerName?',
    name: 'SpatialDisplay',
    component: Empty,
    props: true,
    meta: { authorize: [], sidebar: true },
  },
  {
    path: '/series/node/:nodeId?',
    name: 'TimeSeriesDisplay',
    component: Empty,
    props: true,
    meta: { authorize: [], sidebar: true },
  },
  {
    path: '/systemmonitor',
    name: 'SystemMonitor',
    component: Empty,
    meta: { authorize: [] },
  },
  {
    path: '/archivedisplay',
    name: 'ArchiveDisplay',
    component: Empty,
    meta: { authorize: [] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routesBase,
})

let routesAreInitialized = false

async function handleAuthorization(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
  authorize: string[],
) {
  const currentUser = await authenticationManager.userManager.getUser()
  if (currentUser === null) {
    return next({ name: 'Login', query: { redirect: to.path } })
  }

  const role =
    currentUser.profile.roles !== undefined
      ? (currentUser.profile as any).roles[0]
      : 'guest'

  if (authorize.length && !authorize.includes(role)) {
    return next({ name: 'About' })
  }
}

async function addDynamicRoutes() {
  console.log('init routes')
  const store = useConfigStore()
  await store.setFewsConfig()
  Object.values(store.components).forEach((component: any) => {
    const route = dynamicRoutes.find((route) => route.name === component.type)
    if (route !== undefined) {
      console.log('add', route.name)
      router.addRoute(route)
    }
  })
}

router.beforeEach(async (to, _from, next) => {
  const authorize = to.meta?.authorize as string[]
  if (authorize && configManager.authenticationIsEnabled) {
    await handleAuthorization(to, _from, next, authorize)
  }

  if (!routesAreInitialized) {
    await addDynamicRoutes()
    routesAreInitialized = true
    router.replace(to)
  }

  if (to.path === '/auth/callback') {
    const user =
      await authenticationManager.userManager.signinRedirectCallback()
    const path: string = user.state === null ? '/about' : (user.state as string)
    next({ path })
  }

  next()
})

export default router
