<template>
  <el-container class="home_container">
    <!--头部区域-->
    <el-header>
      <div class="home_header">
        <img src="../assets/logo1.jpg">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!--控制水平折叠按钮-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--侧边栏导航菜单区域-->
        <el-menu
          background-color="#333744"
          unique-opened :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
          text-color="#fff"
          active-text-color="#409bff">
          <!--一级菜单-->
          <el-submenu :index="item.id.toString()" v-for="item in menuList" :key="item.id">
            <!--一级菜单模板区域-->
            <template slot="title">
              <!--图片-->
              <i :class="iconsObj[item.id]"></i>
              <!--文本-->
              <span>{{ item.authName }}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <!--二级菜单模板区域-->
              <template slot="title">
                <!--图片-->
                <i :class="iconsObj2[subItem.id]"></i>
                <!--文本-->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容主体区域-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      //  左侧菜单数据
      menuList: [],
      //  一级字体图标
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //  二级字体图标
      iconsObj2: {
        '110': 'iconfont icon-yonghuliebiao',
        '111': 'iconfont icon-role-list',
        '112': 'iconfont icon-quanxianliebiao',
        '104': 'iconfont icon-shangpinliebiao',
        '115': 'iconfont icon-fenlei-0',
        '121': 'iconfont icon-shangpinfenlei',
        '107': 'iconfont icon-dingdanliebiao',
        '146': 'iconfont icon-shujubaobiao'
      },
      //  控制折叠  默认不折叠
      isCollapse: false,
      //  链接的激活状态
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //  退出登录
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //  获取左侧菜单栏数据
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      //  console.log(res)
    },
    //  切换菜单折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    //  保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped type="text/less" lang="less">
  .home_container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    font-size: 24px;
    padding-left: 0;

    .home_header {
      display: flex;
      align-items: center;

      img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }

      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    text-align: center;
    line-height: 30px;
    font-size: 10px;
    cursor: pointer;
    color: #ffffff;
    letter-spacing: .3em;
  }
</style>
