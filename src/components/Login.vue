<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!--表单区域-->
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px" class="login_form">
        <!--用户名区域-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!--密码区域-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
        </el-form-item>
        <!--按钮区域-->
        <el-form-item class="bTns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //  表单登录的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //  表单的验证规则对象
      loginFormRules: {
        //  验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        //  验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //  点击重置按钮  重置登录表单
    //  console.log(this)
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    //  点击登录按钮   线校验表单提交格式是否正确  如果正确就发起 ajax 请求
    //  validate 第一个参数得到的是一个布尔值 true 代表校验成功 反之为失败
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        //  如果失败了直接 return 跳出函数
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功！')
        //  1. 将登录成功之后的 token 保存到客户端的 sessionStorage 中
        //  1.1 项目中除了登录之外的其他 API 接口，必须在登录成功之后生效
        //  1.2 token 只应在当前网站打开期间生效，所以 token 保存在 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token)
        //  2. 通过编程式导航跳转到后台主页，路由地址时 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style scoped lang="less" type="text/less">
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #ffffff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 3px;

    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eeeeee;
      border-radius: 50%;
      box-shadow: 0 0 10px #dddddd;
      padding: 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #ffffff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eeeeee;
      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
  }

  .bTns {
    display: flex;
    justify-content: flex-end;
  }
</style>
