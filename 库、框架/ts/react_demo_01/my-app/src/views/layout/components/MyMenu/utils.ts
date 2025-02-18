import { useCustomRoutes } from '@/router';
import { menus_recoil, type Menus } from '@/store/user';
import { cache } from '@/utils';
import { type SidebarStatus } from '@/utils/localStore';
import { type SetStateAction, type Dispatch, useState, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { getRecoil } from 'recoil-nexus';

/**
 * 根据菜单信息获取到所有的路径，以供给搜索菜单时使用
 */
export interface MenuRoutes {
  /** 跳转路径 */
  path: string;
  /** 菜单名称 */
  title: string;
}
export const getMenuRoutes = function () {
  const menuRoutes: MenuRoutes[] = [];
  const resolveMenuRoute = function (mens: Menus[], startTitle = '') {
    for (const men of mens) {
      if (typeof men.path === 'string') {
        // 此时为跳转路径
        menuRoutes.push({
          path: men.path,
          title: startTitle + men.title,
        });
      } else if (Array.isArray(men.children)) {
        resolveMenuRoute(men.children, `${startTitle}${men.title} > `);
      }
    }
  };

  resolveMenuRoute(getRecoil(menus_recoil));
  return menuRoutes;
};

/**
 * 根据 id 查找菜单列表
 */
export const getMenuRouteInfo = cache(function (
  id: string,
  menus?: Menus[] /** 添加一个参数，保证缓存新鲜度 */
) {
  let result: Menus[] | undefined;
  const recursion = function (menus: Menus[], routes: Menus[]) {
    for (const menu of menus) {
      let copyRoutes = routes.slice();
      copyRoutes.push(menu);
      if (id === menu.id) {
        // 取得结果，结束递归
        result = copyRoutes;
        throw new Error('抛出错误，提前结束递归，取巧');
      } else if (Array.isArray(menu.children)) {
        // 存在子菜单，继续递归
        recursion(menu.children, copyRoutes);
      }
    }
  };

  try {
    recursion(menus || getRecoil(menus_recoil), []);
  } catch (e) {
    if (result) {
      return result;
    }
  }
});

/**
 * 获取路由对应的菜单展开项
 */
export function useGetRouteMenu() {
  // 当前路由对应的注册路由信息
  const match = useCustomRoutes();
  const currentRoute = match && match[match.length - 1].route.meta;
  const menus = useRecoilValue(menus_recoil);
  /**
   * 选中路由对应的菜单 id
   */
  let id = currentRoute?.id;

  return id ? getMenuRouteInfo(id, menus) || [] : [];
}

/**
 * 加载菜单选中项
 */
export function useSesolveMenuSelected(
  sidebarStatus: SidebarStatus
): [string[], string[], Dispatch<SetStateAction<string[]>>] {
  // 当前选中的菜单项 key 数组
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  // 当前展开的 SubMenu 菜单项 key 数组
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  // 当前路由对应的注册路由信息
  const match = useCustomRoutes();
  const oldSidebarStatus = useRef(sidebarStatus);

  let _selectedKeys: string[] = [];
  let _openKeys: string[] = [];

  const currentRoute = match && match[match.length - 1].route.meta;
  let id: string | undefined; // 选中菜单的 id;
  if (
    currentRoute &&
    ((id = currentRoute?.activeMenu) || (id = currentRoute?.id)) &&
    (id !== selectedKeys[0] ||
      (oldSidebarStatus.current === 3 &&
        oldSidebarStatus.current !== sidebarStatus)) // 只有当路由变化时才需要重新计算，似乎可以使用 useEffect 更好的完成
  ) {
    // 根据 id 查找出选中的菜单项和展开的菜单项
    const menuRoutes = getMenuRouteInfo(id) || [];
    _selectedKeys.push(id);
    menuRoutes.forEach(({ id: childId }) => {
      if (childId !== id) {
        _openKeys.push(childId);
      }
    });
    setSelectedKeys(_selectedKeys);

    // 根据菜单展开状态来判断需要展开的菜单项
    let totalOpenKeys: string[] = [];
    if (sidebarStatus !== 3) {
      totalOpenKeys = [...new Set([..._openKeys, ...openKeys])];
    }
    setOpenKeys(totalOpenKeys);
  }
  oldSidebarStatus.current = sidebarStatus;

  return [selectedKeys, openKeys, setOpenKeys];
}
