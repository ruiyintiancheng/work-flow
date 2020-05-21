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
      <search-form v-show="searchToggle" ref="searchForm" :inputCount="3" :searchFormData="processConfigData"></search-form>
    </div>
    <div class="base-row">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="ul" />
            <span>流程信息列表</span>
          </div>
            <div class="row-option">
            <a @click="processTableToggle=false" v-if="processTableToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
            <a @click="processTableToggle=true" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
            </div>
        </div>
        <basic-table v-show="processTableToggle" ref="basicProcessTable" :tableOption="processConfigData" :height="processHeight" :pagenation="true" :rowNum="true">
          <template slot="optionColumn">
              <el-table-column width="254px" label="操作" align="center" fixed="right">
                  <template slot-scope="scope">
                      <el-button type="primary" plain size="mini" @click="viewImage(scope.row)">查看流程图</el-button>
                  </template>
              </el-table-column>
          </template>
        </basic-table>
        <el-dialog :title="'流程图'" :visible.sync="processVisible" v-el-drag-dialog :close-on-click-modal="false" width="65%" custom-class="dialog-default">
            <div>
                <img :src="imageResponseUrl"/>
            </div>
        </el-dialog>
    </div>
  </div>
</template>
<script>
import BasicTable from 'basic-table-ry'
import SearchForm from 'search-form-ry'
import UpdateForm from 'update-form-ry'
import request from '@/utils/request'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'

const processURL = '/flows/findProcessDefinitionList'
const imageUrl = '/flows/viewImage'
const deleteUrl = '/flows/delDeployment'
export default {
  directives: { elDragDialog },
  name: 'activitiDeployMgrIndex',
  components: {
    SearchForm,
    UpdateForm,
    BasicTable
  },
  data() {
    return {
      searchToggle: true,
      processTableToggle: true,
      processConfigData: {},
      imageResponseUrl: '',
      processHeight: '',
      processVisible: false
    }
  },
  created() {
    this.getOption()
    // this.processHeight = this.$store.state.app.containHeight - 330
  },
  methods: {
    getOption() {
      baseRequest(processURL, { deploymentName: '', definitionName: '' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.processConfigData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicProcessTable.getData(processURL, param)
      })
    },
    searchOption() {
      this.$refs.basicProcessTable.getData(processURL, this.$refs.searchForm.searchParam())
    },
    deleteDeploy(row) {
      baseRequest(deleteUrl, { id: row.id }).then(response => {
        if (response.code === 1) {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getOption()
        } else {
          this.$message({
            type: 'success',
            message: '删除失败!'
          })
        }
      })
    },
    viewImage(row) {
      this.processVisible = true
      request({
        url: imageUrl,
        method: 'post',
        data: { deploymentId: row.deploymentId, diagramResourceName: row.diagramResourceName },
        responseType: 'arraybuffer'
      }).then(response => {
        this.imageResponseUrl = 'data:image/png;base64,' + btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
      })
    }
  }
}
</script>