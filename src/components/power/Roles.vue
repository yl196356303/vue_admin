<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表区域-->
      <el-table :data="rolesList" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限权限-->
              <el-col :span="19">
                <!--通过for循环嵌套渲染二级权限-->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--三级权限-->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!--<pre>-->
            <!--{{ scope.row }}-->
            <!--</pre>-->
          </template>
        </el-table-column>
        <!--索引区域-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="rolesEditDialog(scope.row.id)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRolesById(scope.row.id)">
              删除
            </el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加角色对话框区域-->
    <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" width="50%" @close="addRolesDialogClose">
      <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改角色对话框区域-->
    <el-dialog title="编辑角色" :visible.sync="EditRolesDialogVisible" width="50%" @close="EditRolesDialogClose">
      <el-form :model="editRolesData" :rules="editRolesDataRules" ref="editRolesDataRef" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="editRolesData.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesData.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配权限对话框-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDiglogClosed">
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //  角色列表
      rolesList: [],
      //  控制添加角色对话框的显示与隐藏  默认为隐藏
      addRolesDialogVisible: false,
      //  控制添加角色对话框的显示与隐藏  默认为隐藏
      EditRolesDialogVisible: false,
      //  控制分配权限对话框的显示与隐藏  默认未隐藏
      setRightDialogVisible: false,
      //  添加角色数据对象
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      //  根据 id 查询角色数据
      editRolesData: {},
      //  权限列表
      rightsList: [],
      //  树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //  默认选中的节点 ID 值数组
      defKeys: [],
      //  当前即将分配角色权限的 ID
      roleId: '',
      //  添加角色 验证规则
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ]
      },
      //  编辑角色验证对象
      editRolesDataRules: {
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    //  获取角色列表数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      //  console.log(this.rolesList)
    },
    //  监听 添加角色对话框关闭事件
    addRolesDialogClose () {
      //  对该表单项进行重置，将其值重置为初始值并移除校验结果
      this.$refs.addRolesFormRef.resetFields()
    },
    //  添加角色
    async addRoles () {
      const { data: res } = await this.$http.post('roles', this.addRolesForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加角色失败！')
      }
      this.$message.success('添加角色成功！')
      //  重新获取数据  刷新角色列表
      this.getRolesList()
      //  隐藏添加对话框
      this.addRolesDialogVisible = false
    },
    //  监听 修改角色对话框关闭事件
    EditRolesDialogClose () {
      //  对该表单项进行重置，将其值重置为初始值并移除校验结果
      this.$refs.editRolesDataRef.resetFields()
    },
    //  根据 id 获取角色信息
    async rolesEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败！')
      }
      this.editRolesData = res.data
      this.EditRolesDialogVisible = true
    },
    //  编辑角色
    EditRoles () {
      //  先判断 表单数据验证是否通过
      this.$refs.editRolesDataRef.validate(async valid => {
        if (!valid) return
        //  发起修改请求
        const { data: res } = await this.$http.put('roles/' + this.editRolesData.roleId, {
          roleName: this.editRolesData.roleName,
          roleDesc: this.editRolesData.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败！')
        }
        //  关闭对话框
        this.EditRolesDialogVisible = false
        //  重新获取数据  刷新页面
        this.getRolesList()
        //  提示用户修改数据成功
        this.$message.success('修改角色信息成功！')
      })
    },
    //  根据 id 删除对应的角色
    async removeRolesById (id) {
      //  弹出提示框 询问用户是否确定删除
      const confirmResult = await this.$confirm('你确定删除该角色吗？, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除角色失败！')
      }
      //  删除成功 重新获取数据 刷新列表
      this.getRolesList()
      this.$message.success('删除用户成功！')
    },
    //  删除角色指定权限
    async removeRightById (role, rightId) {
      //  询问用户是否要删除指定权限
      const confirmResult = await this.$confirm('你确定要删除该权限吗?, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除!')
      }
      //  删除操作
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      //  返回的data, 是当前角色下最新的权限数据
      role.children = res.data
      this.$message.success('删除权限成功!')
    },
    //  获取所有权限数据  显示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('权限列表获取失败!')
      }
      this.rightsList = res.data
      //  通过递归获取三级权限节点 ID
      // console.log(role)
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //  通过递归的形式, 获取角色下所有三级权限下的 ID 值 并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      //  如果当前节点不包含 children 则说明是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      //  最终 arr 数组得到的是该角色小所有的三级权限ID
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //  监听分配权限对话框关闭事件
    setRightDiglogClosed () {
      //  关闭就清空默认勾选的素组 防止数组累积
      this.defKeys = []
    },
    //  点击为角色分配权限
    async allotRights () {
      const keys = [
        //  回目前被选中的节点的 key 所组成的数组 getCheckedKeys
        //  返回目前半选中的节点所组成的数组 getHalfCheckedNodes
        //  通过 es6 的展开运算符 ... 拼接成一个数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(this.$refs.treeRef.getCheckedKeys())
      // console.log(this.$refs.treeRef.getHalfCheckedKeys())
      // console.log(keys)
      const idStr = keys.join(',')
      //  发起请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.$message.success('分配权限成功!')
      //  重新获取数据 刷新列表
      this.getRolesList()
      //  隐藏分配权限对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style scoped lang="less" type="text/less">
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eeeeee;
  }
  .bdbottom {
    border-bottom: 1px solid #eeeeee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
