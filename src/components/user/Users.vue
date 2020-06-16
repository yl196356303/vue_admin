<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加</el-button>
        </el-col>
      </el-row>

      <!--table表格区域-->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" @click="removeUserById(scope.row.id)" icon="el-icon-delete"
                       size="mini"></el-button>
            <!--分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户对话框-->
    <el-dialog
      title="提示"
      :visible.sync="EditDialogVisible"
      width="50%" @close="editDialogClose">
      <el-form :model="editData" :rules="editDataRules" ref="editDataRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editData.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editData.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editData.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配角色对话框-->
    <el-dialog title="分配角色" :visible.sync="setRoledialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    //  验证手机号是否合法
    var checkMobile = (rule, value, callback) => {
      //  验证手机号的正则表达式
      const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/
      if (regMobile.test(value)) {
        //  合法的手机号
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      //  获取用户列表数据的参数
      queryInfo: {
        //  查询参数
        query: '',
        //  当前页数
        pagenum: 1,
        //  每页显示多少条数据
        pagesize: 2
      },
      //  用户数据列表
      userList: [],
      //  总数据条数
      total: 0,
      //  控制对话框的显示与隐藏  默认隐藏
      addDialogVisible: false,
      //  添加用户数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //  添加用户表单验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //  控制修改用户对话框的显示与隐藏  默认为隐藏
      EditDialogVisible: false,
      //  根据 id 查询到的数据对象
      editData: {},
      //  控制分配角色的显示与隐藏  默认隐藏
      setRoledialogVisible: false,
      //  当前行的用户信息
      userInfo: {},
      //  角色列表
      rolesList: [],
      //  已选中的角色 Id
      selectedRoleId: '',
      //  修改用户数据表单验证规则规则
      editDataRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    //  获取用户数据列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
      //  console.log(res)
    },
    //  监听 pageSize 改变的事件
    handleSizeChange (newpage) {
      this.queryInfo.pagesize = newpage
      this.getUserList()
      // console.log(newpage)
    },
    //  监听 页码值发生改变时触发
    handleCurrentChange (newCurrentPage) {
      this.queryInfo.pagenum = newCurrentPage
      this.getUserList()
      // console.log(newCurrentPage)
    },
    //  更新用户状态
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    //  监听 对话框关闭的事件
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    //  添加用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        //  验证失败直接 return
        if (!valid) return
        //  可以发送添加用户的请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        //  隐藏对话框
        this.addDialogVisible = false
        //  重新获取列表数据
        this.getUserList()
      })
    },
    //  根据 id 查询数据
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户数据失败！')
      }
      this.editData = res.data
      this.EditDialogVisible = true
    },
    //  监听  修改用户对话框关闭的事件
    editDialogClose () {
      this.$refs.editDataRef.resetFields()
    },
    //  修改用户信息
    editUserInfo () {
      //  先验证表单规则是否通过
      this.$refs.editDataRef.validate(async valid => {
        //  如果没通过  直接 return
        if (!valid) return
        //  发起修改用户数据请求
        const { data: res } = await this.$http.put('users/' + this.editData.id, {
          email: this.editData.email,
          mobile: this.editData.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }
        //  关闭对话框
        this.EditDialogVisible = false
        //  重新获取数据  刷新页面
        this.getUserList()
        //  提示用户更新成功
        this.$message.success('更新用户信息成功')
      })
    },
    //  根据 ID 删除用户数据
    async removeUserById (id) {
      //  弹出提示框 询问用户是否删除
      const confirmResult = await this.$confirm('你确定要删除这条数据吗？, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //  return err
      // console.log(confirmResult)
      // 如果用户点击确认返回字符串 confirm
      //  如果用户点击取消返回字符串 cancel
      //  这个时候我们可以做一个判断
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      //  删除操作
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败！')
      }
      //  删除成功 重新获取数据 刷新列表
      this.getUserList()
      this.$message.success('删除用户成功！')
    },
    //  展示分配角色对话框
    async setRole (userInfo) {
      this.userInfo = userInfo
      //  获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败!')
      }
      this.rolesList = res.data
      //  显示分配角色对话框
      this.setRoledialogVisible = true
    },
    //  点击按钮 分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      //  发起请求
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败!')
      }
      this.$message.success('更新角色成功!')
      //  重新获取数据  刷新列表
      this.getUserList()
      //  关闭对话框
      this.setRoledialogVisible = false
    },
    //  监听分配角色对话框关闭事件
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = ''
    }
  }
}
</script>

<style scoped>
</style>
