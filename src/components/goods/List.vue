<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!--table表格区域-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column width="120px" label="商品价格（元）" prop="goods_price"></el-table-column>
        <el-table-column width="80px" label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column width="180px" label="创建时间" prop="add_time">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column width="130px" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //  请求参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //  商品列表
      goodsList: [],
      //  总数据条数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    //  根据分页获取对应的数据列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败！')
      }
      // console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    //  监听 pagesize 变化的事件
    handleSizeChange (newPage) {
      this.queryInfo.pagesize = newPage
      //  重新获取数据
      this.getGoodsList()
    },
    //  监听 pagenum 变化的事件
    handleCurrentChange (newSize) {
      this.queryInfo.pagenum = newSize
      //  重新获取数据
      this.getGoodsList()
    },
    //  根据 Id 删除对应商品
    async removeById (id) {
      //  询问用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除！')
      }
      //  删除业务逻辑
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品成功！')
      }
      //  重新获取数据
      this.getGoodsList()
      //  提示用户删除成功
      this.$message.success('删除商品成功！')
    },
    //  编程式导航跳转到 添加商品页面
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped>

</style>
