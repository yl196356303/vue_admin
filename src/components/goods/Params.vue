<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--alert警告区域-->
      <el-alert
        title="注意：只允许第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="catePorps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!--tabs 标签页区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!--添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="small" :disabled="isBtnDisabled" @click="addParamsdialogVisible = true">添加动态参数</el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" stripe border>
            <!--展开项-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--v-for 渲染 Tag 标签区域-->
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>
                <!--添加 Tag 标签区域-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引项-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!--添加静态属性的面板-->
        <el-tab-pane label="静态参数" name="only">
          <el-button type="primary" size="small" :disabled="isBtnDisabled" @click="addParamsdialogVisible = true">添加静态参数</el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTableData" stripe border>
            <!--展开项-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--v-for 渲染 Tag 标签区域-->
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>
                <!--添加 Tag 标签区域-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引项-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!--添加参数对话框-->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsdialogVisible"
      width="50%"
      @close="addParamsDialogClose">
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑参数对话框-->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editParamsdialogVisible"
      width="50%"
      @close="editParamsDialogClose">
      <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //  商品分类列表数据
      cateList: [],
      //  级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //  级联选择框配置对象
      catePorps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //  被激活页 tabs 标签页的名称  默认激活 many
      activeName: 'many',
      //  动态参数数据列表
      manyTableData: [],
      //  静态属性数据列表
      onlyTableData: [],
      //  控制添加参数对话框的显示与隐藏  默认隐藏
      addParamsdialogVisible: false,
      //  添加参数表单数据对象
      addParamsForm: {
        attr_name: ''
      },
      //  添加参数表单验证规则对象
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //  控制修改对话框的显示与隐藏  默认显示
      editParamsdialogVisible: false,
      //  编辑参数表单验证规则对象
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //  根据 id 查到的参数对象
      editParamsForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    //  获取所有商品数据的分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      this.cateList = res.data
      // console.log(res.data)
    },
    //  监听级联选择框变化的函数
    handleChange () {
      this.getParamsData()
    },
    //  tabs页点击事件的处理函数
    handleTabsClick () {
      this.getParamsData()
      // console.log(this.activeName)
    },
    //  获取参数列表数据
    async getParamsData () {
      //  如果 selectedCateKeys 的 length 不为 3 则证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        //  清空数组
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //  反之则证明选中的是三级分类
      //  根据所选分类的 id 和当前所处的面板 获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      //  将获取到的 数据中的 attr_vals 字符串 以空格形式分割成数组
      res.data.forEach(item => {
        //  判断 attr_vals 是否为空  null 会返回false
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //  为每一项添加一个控制 添加 Tag input 输入框显示与隐藏的inputVisible 默认隐藏
        item.inputVisible = false
        //  input 的双向绑定数据值
        item.inputValue = ''
      })
      // console.log(res.data)
      //  对获取过来的数据进判断
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //  监听 添加参数对话框的关闭事件
    addParamsDialogClose () {
      //  重置表单为默认状态
      this.$refs.addParamsFormRef.resetFields()
    },
    //  点击按钮添加参数
    addParams () {
      //  先校验表单验证规则对象是否通过
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        //  发起请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.status !== 201) {
          this.$message.error('添加参数失败！')
        }
        //  重新获取数据  刷新页面
        this.getParamsData()
        //  提示用户添加成功
        this.$message.success('添加参数成功！')
        //  隐藏添加参数对话框
        this.addParamsdialogVisible = false
      })
    },
    //  监听 修改参数对话框的关闭事件
    editParamsDialogClose () {
      //  重置表单为默认状态
      this.$refs.editParamsFormRef.resetFields()
    },
    //  点击展示编辑对话框  获取对应 id 数据
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editParamsForm = res.data
      this.editParamsdialogVisible = true
    },
    //  点击按钮修改参数
    editParams () {
      //  先校验表单验证规则是否通过
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        //  发起修改请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新参数信息失败！')
        }
        //  重新获取数据 刷新页面
        this.getParamsData()
        //  提示用户更新成功
        this.$message.success('更新参数信息成功！')
        //  隐藏对话框
        this.editParamsdialogVisible = false
      })
    },
    //  根据 id 删除对应参数
    async removeParams (id) {
      //  先询问用户是否确认删除
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        //  捕获取消操作的错误 return 出去
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作')
      }
      //  删除业务逻辑
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      //  重新获取数据 刷新列表
      this.getParamsData()
      //  提示用户删除成功
      this.$message.success('删除参数成功！')
    },
    //  添加 Tag 标签 input 输入框失去焦点 和 按下 Enter 的事件
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        //  隐藏 input 输入框
        row.inputVisible = false
        return
      }
      //  如果没有 return 则证明需要做后续操作
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //  需要发起请求 保存操作
      this.saveAttrVals(row)
    },
    //  点击按钮展示添加 Tag 标签的 input 输入框
    showInput (row) {
      //  显示 input 输入框
      row.inputVisible = true
      //  $nextTick的作用是：当页面中的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //  将对 attr_vals 的操作 保存到数据库
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改参数成功！')
    },
    //  删除 Tag 标签事件
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      //  保存操作
      this.saveAttrVals(row)
    }
  },
  computed: {
    //  如果按钮需要被禁用 则返回 true 否则返回 false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        //  禁用
        return true
      }
      return false
    },
    //  当前选中三级分类的 ID
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[this.selectedCateKeys.length - 1]
      }
      return null
    },
    //  动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped lang="less" type="text/less">
  .cat_opt {
    margin: 15px 0;
  }
  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
      width: 130px;
  }
</style>
