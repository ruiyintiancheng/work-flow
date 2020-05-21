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
      <search-form v-show="searchToggle" ref="searchForm" :inputCount="3" :searchFormData="configData"></search-form>
    </div>
    <div class="base-row">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="ul" />
            <span>数据列表</span>
          </div>
            <div class="row-option">
            <el-button icon="el-icon-plus" @click="addModel" >添加</el-button>
            <a @click="tableToggle=false" v-if="tableToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
            <a @click="tableToggle=true" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
            </div>
        </div>
        <basic-table v-show="tableToggle" ref="basicTable" :tableOption="configData" :pagenation="true" :rowNum="true">
            <template slot="optionColumn">
                <el-table-column width="254px" label="操作" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" plain size="mini" @click="editModel(scope.row)">编辑</el-button>
                        <el-button type="success" plain size="mini" @click="deployModel(scope.row)">部署</el-button>
                        <el-button type="danger" plain size="mini" @click="deleteModel(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </template>
        </basic-table>
        <el-dialog :title="modelTitle" :visible.sync="modelVisible">
            <el-form :model="modelForm" ref="modelForm" :rules="rules" style="width:500px;margin:10px 200px;">
                <el-form-item label="模型名称" :label-width="formLabelWidth" prop="name">
                    <el-input v-model="modelForm.name" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="modelVisible = false" v-cloak>取 消</el-button>
                <el-button type="primary" @click="saveModel" v-cloak>确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="'模型编辑'" :visible.sync="modelEditVisible" width="95%">
          <iframe :src="activitiUrl" width="100%" :height="frameHeight" frameborder="0"></iframe>
        </el-dialog>
    </div>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import UpdateForm from 'update-form-ry'
import BasicTable from 'basic-table-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'

const url = '/models/selects'
const addURL = '/models/addModel'
const deployURL = '/models/deployModel'
const deleteURL = '/models/deleteModel'
export default {
  directives: { elDragDialog },
  name: 'activitiIndex',
  components: {
    SearchForm,
    UpdateForm,
    BasicTable
  },
  data() {
    return {
      dialogEditFlowVisible: false,
      searchToggle: true,
      configData: {},
      modelVisible: false,
      modelEditVisible: false,
      frameHeight: '',
      activitiUrl: '',
      modelTitle: '',
      rules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur'	}
        ], version: [
          { required: true, message: '请输入版本号', trigger: 'blur' }
        ]
      },
      modelForm: {
        name: '',
        version: ''
      },
      formLabelWidth: '120px',
      tableToggle: true
    }
  },
  created() {
    this.getOption()
    this.frameHeight = this.$store.state.app.containHeight - 185 + 'px'
  },
  methods: {
    getOption() {
      baseRequest(url, { name: '' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    searchOption() {
      this.$refs.basicTable.getData(url, this.$refs.searchForm.searchParam())
    },
    editModel(row) {
      // window.open('static/activiti/modeler.html?modelId=' + row.ID)
      this.modelEditVisible = true
      this.activitiUrl = 'static/activiti/modeler.html?modelId=' + row.id
    },
    addModel() {
      for (const key in this.model) {
        this.model[key] = ''
      }
      this.modelVisible = true
      this.modelTitle = '新建模型'
    },
    deleteModel(row) {
      baseRequest(deleteURL, { modelId: row.id }).then(response => {
        if (response.code === 1) {
          this.modelVisible = false
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getOption()
        } else {
          this.modelVisible = false
          this.$message.error('删除失败!')
        }
      })
    },
    deployModel(row) {
      baseRequest(deployURL, { modelId: row.id }).then(response => {
        if (response.code === 1) {
          this.modelVisible = false
          this.$message({
            type: 'success',
            message: '部署成功!'
          })
          this.getOption()
        } else {
          this.modelVisible = false
          this.$message.error(response.msg)
        }
      })
    },
    saveModel() {
      this.$refs.modelForm.validate((valid) => {
        if (valid) {
          baseRequest(addURL, this.modelForm).then(response => {
            if (response.code === 1) {
              this.modelVisible = false
              this.$message({
                type: 'success',
                message: '添加成功!'
              })
              this.getOption()
            } else {
              this.modelVisible = false
              this.$message.error('添加失败!')
            }
          })
        }
      })
    },
    editFlow() {
      this.dialogEditFlowVisible = true
    },
    confirm() {
      this.dialogEditFlowVisible = false
    }
  }
}
</script>