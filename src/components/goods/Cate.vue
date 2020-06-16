<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--table表格区域-->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        :border="true"
        :show-index="true"
        index-text="#">
        <template slot="isOK" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>

    <!--添加商品分类对话框-->
    <el-dialog
      title="添加商品"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose">
      <!--添加分类的表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!--cascader 级联选择框区域-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑商品对话框-->
    <el-dialog
      title="编辑商品"
      :visible.sync="EditCatedialogVisible"
      width="50%"
      @close="EditCateDialogClose">
      <el-form :model="editCateData" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateData.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //  查询条件
      queryInfo: {
        type: 3,
        //  默认请求第一页
        pagenum: 1,
        //  默认一页放 5 条数据
        pagesize: 5
      },
      //  商品分类列表数据
      cateList: [],
      //  总数据条数
      total: 0,
      //  表格各列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //  表示将当前列 定义为模板列
          type: 'template',
          //  表示当前这一列使用的模板名称
          template: 'isOK'
        },
        {
          label: '排序',
          //  表示将当前列 定义为模板列
          type: 'template',
          //  表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          //  表示将当前列 定义为模板列
          type: 'template',
          //  表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      //  控制对话框的显示与隐藏 默认隐藏
      addCateDialogVisible: false,
      //  添加分类的表单数据对象
      addCateForm: {
        //  父级分类的 ID  默认为添加父类 1级分类
        cat_pid: 0,
        //  将要添加分类的名称
        cat_name: '',
        //  分类的等级  默认要添加的是 1 级分类
        cat_level: 0
      },
      //  添加分类的表单验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      //  父级分类数据列表
      parentCateList: [],
      //  级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      //  级联选择器选中的父类 ID 数组
      selectedKeys: [],
      //  控制编辑商品对话框的显示与隐藏  默认隐藏
      EditCatedialogVisible: false,
      //  根据 id 查询到的数据对象
      editCateData: {},
      //  编辑商品对话框验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      //  根据 id 删除 对应的商品信息
      async removeCateById (id) {
        //  先询问用户是否确认删除
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          //  捕获取消按钮的错误信息
        }).catch(err => err)
        // console.log(confirmResult)
        // 如果用户点击确认返回字符串 confirm
        //  如果用户点击取消返回字符串 cancel
        //  这个时候我们可以做一个判断
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除！')
        }
        //  删除操作
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('删除商品信息失败！')
        }
        //  重新获取数据  刷新页面
        this.getCateList()
        //  提示用户删除成功
        this.$message.success('删除商品信息成功！')
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    //  获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      //  console.log(res.data)
      //  把数据列表赋值给 cateList
      this.cateList = res.data.result
      //  为总数据条数赋值
      this.total = res.data.total
    },
    //  监听 pagesize 变化的事件
    handleSizeChange (newSize) {
      //  把当前最新的 pagesize 赋值给请求参数
      this.queryInfo.pagesize = newSize
      //  重新获取数据  刷新页面
      this.getCateList()
    },
    //  监听 pagenum 变化的事件
    handleCurrentChange (newPage) {
      //  把当前最新的 pagenum 赋值给请求参数
      this.queryInfo.pagenum = newPage
      //  重新获取数据  刷新页面
      this.getCateList()
    },
    //  展示添加商品对话框
    showAddCateDialog () {
      //  先获取父级分类数据
      this.getParentCateList()
      //  再显示对话框
      this.addCateDialogVisible = true
    },
    //  获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      //  console.log(res.data)
      this.parentCateList = res.data
    },
    //  监听 级联选择框值的变化
    parentCateChanged () {
      // console.log(this.selectedKeys)
      //  如果 selectedKeys 的 length 大于0 则证明选中了 父级分类
      //  反之 只说明未选中
      // if (this.selectedKeys.length > 0) {
      //   //  父级分类的 ID
      //   this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
      //   //  分类等级
      //   this.addCateForm.cat_level = this.selectedKeys.length
      // } else {
      //   //  父级分类的 ID
      //   this.addCateForm.cat_pid = 0
      //   //  分类等级
      //   this.addCateForm.cat_level = 0
      // }
      if (this.selectedKeys.length === 0) {
        //  父级分类的 ID
        this.addCateForm.cat_pid = 0
        //  分类等级
        this.addCateForm.cat_level = 0
        return
      }
      //  父级分类的 ID
      this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
      //  分类等级
      this.addCateForm.cat_level = this.selectedKeys.length
    },
    //  点击按钮 添加新的分类
    addCate () {
      //  先检查表单验证是否通过
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加商品分类失败！')
        }
        this.$message.success('添加商品分类成功！')
        //  重新获取数据  刷新列表
        this.getCateList()
        //  隐藏对话框
        this.addCateDialogVisible = false
      })
      // console.log(this.addCateForm)
    },
    //  监听添加商品分类对话框关闭事件
    addCateDialogClose () {
      //  重置表单数据
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    //  根据id查询对应数据 展示编辑对话框
    async showEditCate (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败！')
      }
      this.editCateData = res.data
      this.EditCatedialogVisible = true
    },
    //  点击按钮 修改商品数据
    editCateInfo () {
      //  先验证表单验证是否通过
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateData.cat_id, {
          cat_name: this.editCateData.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新商品信息失败！')
        }
        //  重新获取数据  刷新页面
        this.getCateList()
        //  提示用户更新数据成功
        this.$message.success('更新商品信息成功！')
        //  关闭对话框
        this.EditCatedialogVisible = false
      })
    },
    //  监听 编辑对话框关闭事件
    EditCateDialogClose () {
      //  重置表单恢复 默认
      this.$refs.editCateFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" type="text/less">
  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }

  .el-cascader-panel {
    height: 300px!important;
  }
</style>
