<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--提示区域-->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        :closable="false"
        show-icon>
      </el-alert>

      <!--步骤条区域-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--tab栏区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :before-leave="beforeTabsLeave" v-model="activeIndex" :tab-position="'left'" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" naem="0">
            <!--表单数据-->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <!--级联选择框-->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="casAdErProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" naem="1">
            <!--渲染表单 Item 项-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!--复选框组-->
              <el-checkbox-group v-model="item.attr_vals" v-for="(cb, i) in item.attr_vals" :key="i">
                <el-checkbox border :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" naem="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" naem="3">
            <!--action表示图片要上传到服务器的API地址-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" naem="4">
            <!--富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!--添加商品按钮-->
            <el-button type="primary" class="buttonAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--图片预览对话框-->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      //  控制步骤条的进度  和 tab栏的切换
      activeIndex: '0',
      //  添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //  商品所属分类的数组
        goods_cat: [],
        //  上传的图片临时路径（对象）
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      //  添加商品的表单验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      //  商品分类数据列表
      cateList: [],
      //  级联选择框配置对象
      casAdErProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //  动态参数商品列表
      manyTableData: [],
      //  静态属性商品列表
      onlyTableData: [],
      //  图片上传地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //  图片上传组件的 headers 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //  图片预览 url 地址
      previewPath: '',
      //  控制图片对话框的显示与隐藏  默认隐藏
      previewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    //  获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    //  监听 级联选择框 选项发生变化的事件
    handleChange () {
      // console.log(this.addForm.goods_cat)
      //  只允许用户选择三级fenl
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //  切换Tabs标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    beforeTabsLeave (activeName, oldActiveName) {
      //  activeName 即将进入的标签页 name
      //  oldActiveName  即将离开的标签页 name
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    //  tabs 被选中时触发的事件
    async tabClicked () {
      // console.log(this.activeIndex)
      //  证明选中的是 商品动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        // console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败！')
        }
        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },
    //  处理图片预览效果
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    //  处理移除图片的操作
    handleRemove (file) {
      // console.log(file)
      //  获取删除图片的临时路径
      const filePath = file.response.data.tmp_path
      //  从pics数组中找到这个对应的索引值
      const i = this.addForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      //  调用数组中的 splice 方法，把图片信息对象 从pics数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    //  图片上传成功的钩子
    handleSuccess (response) {
      // console.log(response)
      //  拼接得到一个图片对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      //  将图片信息对象 push 到 pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    //  添加商品
    add () {
      //  像校验表单验证规则是否通过
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        //  执行添加业务逻辑
        //  深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //  处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        //  处理静态参数
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)
        //  添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    //  计算 goods_cat 的属性
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" type="text/less">
  .el-form-item__content {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .el-checkbox {
    margin-left: 15px;
  }

  .previewImg {
    width: 100%;
    height: 100%;
  }

  .buttonAdd {
    margin-top: 15px!important;
  }
</style>
