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
        <el-form-item label="批注" prop="comment" style="margin-bottom:10px;">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="leaveBillForm.comment" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom:10px;">
            <div v-for="btn in buttons" :key="btn">
                <el-button type="primary" @click="submitTask(btn)">{{btn}}</el-button>
            </div>
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

const auditUrl = 'http://localhost:8080/flows/viewTaskForm'
const submitUrl = 'http://localhost:8080/flows/submitTask'
export default {
  name: 'activitiWorkFlowTaskForm',
  props: {
    id: String,
    submitCallBack: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      leaveBillForm: {},
      buttons: [],
      commentTableToggle: true,
      commentConfigData: []
    }
  },
  created() {
    axios.post(auditUrl, { 'taskId': this.id })
      .then((response) => {
        this.leaveBillForm = response.data.leavebill
        this.buttons = response.data.outcomeList
        this.commentConfigData = response.data.commentList
      })
  },
  watch: {
    id(val) {
      axios.post(auditUrl, { 'taskId': val })
        .then((response) => {
          this.leaveBillForm = response.data.leavebill
          this.buttons = response.data.outcomeList
          this.commentConfigData = response.data.commentList
        })
    }
  },
  methods: {
    submitTask(btn) {
      this.leaveBillForm.taskId = this.id
      this.leaveBillForm.outcome = btn
      this.leaveBillForm.userName = this.$store.state.user.name
      axios.post(submitUrl, this.leaveBillForm)
        .then((response) => {
          this.submitCallBack()
        })
    }
  }
}
</script>