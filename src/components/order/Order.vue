<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索区域-->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!--table区域-->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--修改地址的对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%" @close="addressDialogClose">
      <el-form :model="addressForm" :rules="addressFormules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="citydata"
            v-model="addressForm.address1"
            :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!--物流进度对话框-->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%">
      <!--时间线-->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
//  导入地址信息包
import citydata from './citydata.js'

export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //  商品订单数据列表
      orderList: [],
      //  商品总数量
      total: 0,
      //  控制修改地址对话框的显示与隐藏  默认隐藏
      addressDialogVisible: false,
      //  修改地址数据对象
      addressForm: {
        address1: [],
        address2: ''
      },
      //  修改对话框验证规则对象
      addressFormules: {
        address1: [
          { required: true, message: '请输入地址名称', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址名称', trigger: 'blur' }
        ]
      },
      citydata,
      //  控制物流进度对话框的显示与隐藏  默认隐藏
      progressDialogVisible: false,
      //  物流进度列表
      progressInfo: []
    }
  },
  created () {
    this.getRoderList()
  },
  methods: {
    //  获取商品订单数据
    async getRoderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('商品订单数据获取失败！')
      }
      // console.log(res)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    //  监听 pagesize 变化的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getRoderList()
    },
    //  监听 pagenum 变化的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getRoderList()
    },
    //  展示修改对话框
    showBox () {
      this.addressDialogVisible = true
    },
    //  监听修改框关闭事件
    addressDialogClose () {
      this.$refs.addressFormRef.resetFields()
    },
    //  获取物流进度数据  展示 物流对话框
    async showProgressBox () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        this.$message.error('获取物流信息失败！')
      }
      this.progressInfo = res.data
      // console.log(this.progressInfo)
      this.progressDialogVisible = true
    }
  }
}
</script>

<style scoped>
  .el-cascader {
    width: 100%;
  }
</style>
