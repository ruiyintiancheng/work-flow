<template>
  <div class="app-container">
    <div class="base-row">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="ul" />
            <span>数据列表</span>
          </div>
            <div class="row-option">
            <a @click="taskTableToggle=false" v-if="taskTableToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
            <a @click="taskTableToggle=true" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
            </div>
        </div>
        <basic-table v-show="taskTableToggle" ref="basicTable" :tableOption="taskConfigData" :pagenation="true" :rowNum="true">
          <template slot="optionColumn">
                <el-table-column width="254px" label="操作" align="center" fixed="right">
                    <template slot-scope="scope">
                      <el-button type="primary" plain size="mini" @click="transactionTask(scope.row)">办理任务</el-button>
                      <el-button type="success" plain size="mini" @click="viewCurrentImage(scope.row)">查看当前流程图</el-button>
                    </template>
                </el-table-column>
            </template>
        </basic-table>
        <el-dialog :title="'流程图'" :visible.sync="processVisible" v-el-drag-dialog :close-on-click-modal="false" width="65%" custom-class="dialog-default">
            <div>
                <img :src="imageResponseUrl" style="position: absolute;top: 0px;left: 0px;"/>
                <div :style="{position:position,border:border,top:acs.y + 'px',left:acs.x + 'px',width:acs.width + 'px',height:acs.height + 'px'}" ></div>
            </div>
        </el-dialog>
        <el-dialog :title="'办理任务'" :visible.sync="taskVisible" v-el-drag-dialog :close-on-click-modal="false" width="65%" custom-class="dialog-default">
          <task-form :id="taskId" :submitCallBack="submitCallBack"></task-form>
        </el-dialog>
    </div>
  </div>
</template>
<script>
import TaskForm from './workflow/taskForm'
import BasicTable from 'basic-table-ry'
import axios from 'axios'
import elDragDialog from '@/directive/el-dragDialog'
import { baseRequest } from '@/api/base'

const taskUrl = '/flows/listTask'
const imageUrl = '/flows/viewImage'
const currentUrl = '/flows/viewCurrentImage'
export default {
  directives: { elDragDialog },
  name: 'activitiTaskMgrIndex',
  components: {
    TaskForm,
    BasicTable
  },
  data() {
    return {
      taskTableToggle: true,
      processVisible: false,
      taskVisible: false,
      imageResponseUrl: '',
      deploymentId: '',
      diagramResourceName: '',
      position: 'absolute',
      border: '1px solid red',
      acs: {},
      taskConfigData: {},
      taskId: ''
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    getOption() {
      baseRequest(taskUrl, { userName: this.$store.state.user.name }).then(response => {
        const result = response.data
        result.tableConfig = JSON.parse(result.tableConfig)
        this.taskConfigData = result
        this.$refs.basicTable.getData(taskUrl, { userName: this.$store.state.user.name })
      })
    },
    transactionTask(row) {
      this.taskId = row.taskId
      this.taskVisible = true
    },
    viewCurrentImage(row) {
      axios.post(currentUrl, { 'taskId': row.taskId })
        .then((response) => {
          this.deploymentId = response.data.deploymentId
          this.diagramResourceName = response.data.diagramResourceName
          this.acs = response.data.acs

          this.processVisible = true
          axios.post(imageUrl, { 'deploymentId': this.deploymentId, 'diagramResourceName': this.diagramResourceName }, { responseType: 'arraybuffer' })
            .then((response) => {
              this.imageResponseUrl = 'data:image/png;base64,' + btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
            })
        })
    },
    submitCallBack() {
      this.taskVisible = false
      this.getOption()
    }
  }
}
</script>