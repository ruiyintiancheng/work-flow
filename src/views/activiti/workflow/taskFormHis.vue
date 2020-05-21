<template>
  <div class="app-container">
    <div class="base-row">
      <el-form :model="leaveBillForm" label-width="80px" ref="leaveBillForm" style="width:500px;margin:10px 200px;">
        <el-form-item label="请假天数" prop="days" style="margin-bottom:10px;">
            <el-input v-model="leaveBillForm.days" auto-complete="off" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="请假原因" prop="content" style="margin-bottom:10px;">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="leaveBillForm.content" auto-complete="off" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark" style="margin-bottom:10px;">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="leaveBillForm.remark" auto-complete="off" :disabled="true"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-row">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="ul" />
            <span>批注列表</span>
          </div>
        </div>
        <el-table v-show="commentTableToggle" :data="commentConfigData" border style="width: 100%">
            <el-table-column prop="time" label="时间" align="center">
            </el-table-column>
            <el-table-column prop="userId" label="批注人" align="center">
            </el-table-column>
            <el-table-column prop="fullMessage" label="批注信息" align="center">
            </el-table-column>
        </el-table>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import elDragDialog from '@/directive/el-dragDialog'

const auditHisUrl = 'http://localhost:8080/flows/viewHisComment'
export default {
  directives: { elDragDialog },
  name: 'activitiWorkFlowtTaskFormHis',
  props: {
    id: Number
  },
  data() {
    return {
      leaveBillForm: {},
      commentTableToggle: true,
      commentConfigData: []
    }
  },
  created() {
    axios.post(auditHisUrl, { 'id': this.id })
      .then((response) => {
        this.leaveBillForm = response.data.leaveBill
        this.commentConfigData = response.data.commentList
      })
  },
  watch: {
    id(val) {
      axios.post(auditHisUrl, { 'id': val })
        .then((response) => {
          this.leaveBillForm = response.data.leaveBill
          this.commentConfigData = response.data.commentList
        })
    }
  },
  methods: {
  }
}
</script>