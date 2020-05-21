<template>
  <div class="app-container">
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="search" />
          <span>筛选查询</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-search" @click="searchOption" type="primary">查询</el-button>
          <el-button icon="el-icon-refresh" @click="getOption" >重置</el-button>
          <a @click="searchToggle=false" v-if="searchToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
          <a  @click="searchToggle=true" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
        </div>
      </div>
      <search-form v-show="searchToggle" ref="searchForm" :inputCount="3" :searchFormData="leaveBillConfigData"></search-form>
    </div>
    <div class="base-row">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="ul" />
            <span>请假申请信息列表</span>
          </div>
            <div class="row-option">
            <el-button icon="el-icon-plus" @click="addLeaveBill" >添加</el-button>
            <a @click="leaveBillTableToggle=false" v-if="leaveBillTableToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
            <a @click="leaveBillTableToggle=true" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
            </div>
        </div>
        <basic-table v-show="leaveBillTableToggle" ref="basicTable" :tableOption="leaveBillConfigData" :pagenation="true" :rowNum="true">
          <template slot="optionColumn">
            <el-table-column prop="state" label="请假状态" align="center" :formatter="stateFormatter">
            </el-table-column>
          </template>
          <template slot="optionColumn">
                <el-table-column width="254px" label="操作" align="center" fixed="right">
                    <template slot-scope="scope">
                      <el-button v-show="scope.row.state === '0'" type="primary" plain size="mini" @click="editLeaveBill(scope.row)">编辑</el-button>
                      <el-button v-show="scope.row.state === '0' || scope.row.state === '2'" type="danger" plain size="mini" @click="deleteLeaveBill(scope.row)">删除</el-button>
                      <el-button v-show="scope.row.state === '0'" type="success" plain size="mini" @click="applyLeave(scope.row)">申请请假</el-button>
                      <el-button v-show="scope.row.state === '1' || scope.row.state === '2'" type="success" plain size="mini" @click="viewLeaveBill(scope.row)">查看审核记录</el-button>
                    </template>
                </el-table-column>
            </template>
        </basic-table>
        <el-dialog :title="leaveTitle + '请假申请'" :visible.sync="leaveBillVisible">
            <el-form :model="leaveBillForm" label-width="80px" ref="leaveBillForm" style="width:500px;margin:10px 200px;">
                <el-form-item label="请假天数" prop="days">
                    <el-input v-model="leaveBillForm.days" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="请假原因" prop="content">
                    <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="leaveBillForm.content" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="leaveBillForm.remark" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="leaveBillVisible = false" v-cloak>取 消</el-button>
                <el-button type="primary" @click="saveLeaveBill" v-cloak>确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="'选择流程'" :visible.sync="chooseProcessVisible">
          <el-form :model="chooseBillForm" label-width="120px" ref="chooseBillForm" :rules="rules" style="width:500px;margin:10px 200px;">
              <el-form-item label="选择流程" prop="processKey">
                <el-select v-model="chooseBillForm.processKey" placeholder="请选择流程">
                  <el-option v-for="item in options" :key="item.key" :label="item.name" :value="item.key"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="chooseProcessVisible = false" v-cloak>取 消</el-button>
                <el-button type="primary" @click="startProcess" v-cloak>确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="'查看审核记录'" :visible.sync="taskHisVisible" v-el-drag-dialog :close-on-click-modal="false" width="65%" custom-class="dialog-default">
          <task-form-his :id="leaveId"></task-form-his>
        </el-dialog>
    </div>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import TaskFormHis from './workflow/taskFormHis'
import BasicTable from 'basic-table-ry'
import axios from 'axios'
import elDragDialog from '@/directive/el-dragDialog'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'

const addUrl = '/leaves/insertLeaveBill'
const homeUrl = '/leaves/getLeaveHome'
const deleteUrl = '/leaves/deleteLeaveBill'
const processURL = '/flows/findProcessDefinitionList'
const startUrl = '/flows/startProcess'
export default {
  directives: { elDragDialog },
  name: 'activitiLeaveMgrIndex',
  components: {
    SearchForm,
    TaskFormHis,
    BasicTable
  },
  data() {
    return {
      leaveBillTableToggle: true,
      searchToggle: true,
      leaveBillConfigData: {},
      leaveBillVisible: false,
      chooseProcessVisible: false,
      taskHisVisible: false,
      leaveTitle: '',
      leaveId: '',
      options: [],
      rules: {
        processKey: [
          { required: true, message: '请选择流程', trigger: 'change'	}
        ]
      },
      chooseBillForm: {
        id: '',
        processKey: '',
        userName: this.$store.state.user.name
      },
      leaveBillForm: {
        days: '',
        content: '',
        remark: ''
      }
    }
  },
  created() {
    this.getOption()
    baseRequest(processURL).then(response => {
      console.log(response)
      this.options = response.data
    })
  },
  methods: {
    getOption() {
      baseRequest(homeUrl, { userName: this.$store.state.user.name }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.leaveBillConfigData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(homeUrl, param)
      })
    },
    searchOption() {
      this.$refs.basicTable.getData(homeUrl, this.$refs.searchForm.searchParam())
    },
    addLeaveBill() {
      this.leaveTitle = '新增'
      this.leaveBillVisible = true
      for (const key in this.leaveBillForm) {
        this.leaveBillForm[key] = ''
      }
      this.leaveBillForm.userName = this.$store.state.user.name
    },
    editLeaveBill(row) {
      this.leaveTitle = '修改'
      this.leaveBillVisible = true
      this.leaveBillForm.id = row.id
      this.leaveBillForm.days = row.days
      this.leaveBillForm.content = row.content
      this.leaveBillForm.remark = row.remark
      this.leaveBillForm.userName = row.userName
      this.leaveBillForm.userId = row.userId
      this.leaveBillForm.state = row.state
    },
    viewLeaveBill(row) {
      this.leaveId = row.id
      this.taskHisVisible = true
    },
    deleteLeaveBill(row) {
      axios.post(deleteUrl, { 'id': row.id })
        .then((response) => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getOption()
        }).catch((response) => {
          this.$message.error('删除失败!')
        })
    },
    applyLeave(row) {
      this.chooseProcessVisible = true
      this.chooseBillForm.processKey = ''
      this.chooseBillForm.id = row.id
    },
    startProcess() {
      this.$refs.chooseBillForm.validate((valid) => {
        if (valid) {
          this.chooseProcessVisible = false
          axios.post(startUrl, this.chooseBillForm)
            .then((response) => {
              this.$message({
                type: 'success',
                message: '请假已申请，等待审批!'
              })
              this.getOption()
            }).catch((response) => {
              this.$message.error('请假失败!')
            })
        }
      })
    },
    saveLeaveBill() {
      let msg = ''
      if (this.leaveTitle === '新增') {
        msg = '新增'
      } else {
        msg = '修改'
      }
      baseRequest(addUrl, this.leaveBillForm).then(response => {
        if (response.code === 1) {
          this.$message({
            type: 'success',
            message: msg + '成功!'
          })
          this.leaveBillVisible = false
          this.getOption()
        } else {
          this.leaveBillVisible = false
          this.$message.error(msg + '失败!')
        }
      }).catch((response) => {
        this.$message.error(msg + '失败,请检查!')
      })
    },
    stateFormatter(row, column) {
      if (row.state === '0') {
        return '初始录入'
      } else if (row.state === '1') {
        return '审核中'
      } else if (row.state === '2') {
        return '审核完成'
      }
    }
  }
}
</script>