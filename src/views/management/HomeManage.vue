<template>
  <div class="wrapper">
    <el-card class="box-card">
      <div class="card__title">用户状态</div>
      <div class="item__total">
        <span>用户总数</span>
        <div style="color: #f33243;">323</div>
      </div>
      <div class="item__wrapper">
        <div class="item__count">
          <span>未知用户</span>
          <div style="color: #717e88;">123</div>
        </div>
        <div class="item__count">
          <span>男性用户</span>
          <div style="color: #0da0f0;">100</div>
        </div>
        <div class="item__count">
          <span>女性用户</span>
          <div style="color: #f458c2;">200</div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card">
      <div class="card__title">笔记状态</div>
      <div class="item__total">
        <span>笔记总数</span>
        <div style="color: #f33243;">123</div>
      </div>
      <div class="item__wrapper">
        <div class="item__count">
          <span>美食笔记</span>
          <div style="color: #ff8107;">100</div>
        </div>
        <div class="item__count">
          <span>探店笔记</span>
          <div style="color: #17db84;">23</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
// import { ref } from 'vue'
export default {
  name: 'HomeManage',
  setup () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
  .box-card {
    display: inline-block;
    width: 350px;
    height: 200px;
    margin: 20px 30px;
  }
  .card__title{
    margin-bottom: 20px;
    font-size: 16px;
    text-align: left;
    font-weight: bold;
  }
  .item__total{
    margin-bottom: 20px;
    /* font-weight: bold; */
    font-size: 16px;
  }
  .item__wrapper{
    display: flex;
    /* font-weight: bold; */
    font-size: 16px;
  }
  .item__count{
    flex: 1;
  }
</style>
