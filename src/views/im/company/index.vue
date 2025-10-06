<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
      :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="企业名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入企业名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="企业代码" prop="code">
              <el-input v-model="queryParams.code" placeholder="请输入统一社会信用代码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
              v-hasPermi="['im:company:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
              v-hasPermi="['im:company:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="companyList">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="企业名称" align="center" prop="name" />
        <el-table-column label="统一社会信用代码" align="center" prop="code" />
        <el-table-column label="联系人姓名" align="center" prop="contactPerson" />
        <el-table-column label="联系电话" align="center" prop="contactPhone" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)"
              v-hasPermi="['im:company:edit']">修改</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)"
              v-hasPermi="['im:company:remove']">删除</el-button>
            <el-button link type="primary" @click="handleShowEmployee(scope.row)">查看员工</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改企业信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <el-form ref="companyFormRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入统一社会信用代码" />
        </el-form-item>
        <el-form-item label="营业执照" prop="license">
          <image-upload v-model="form.license" :width="200" :height="150"></image-upload>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="业务经营范围" prop="bizScope">
          <el-input v-model="form.bizScope" placeholder="请输入业务经营范围" type="textarea" :rows="6" />
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-drawer v-model="employeeVisible" :title="emplpyeeTitle" :size="900" :close-on-press-escape="false"
      :close-on-click-modal="true">
      <employee ref="employeeRef"></employee>
    </el-drawer>
  </div>
</template>

<script setup name="Company" lang="ts">
import { listCompany, getCompany, delCompany, addCompany, updateCompany } from '@/api/im/company';
import { CompanyVO, CompanyQuery, CompanyForm } from '@/api/im/company/types';
import employee from './employee.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const companyList = ref<CompanyVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const employeeVisible = ref(false);
const queryFormRef = ref<ElFormInstance>();
const companyFormRef = ref<ElFormInstance>();
const employeeRef = ref();
const emplpyeeTitle = ref();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CompanyForm = {
  id: undefined,
  name: undefined,
  code: undefined,
  license: undefined,
  bizScope: undefined,
  contactPerson: undefined,
  contactPhone: undefined,
  deleted: undefined,
  creator: undefined,
}
const data = reactive<PageData<CompanyForm, CompanyQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    code: undefined
  },
  rules: {
    id: [
      { required: true, message: "id不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "企业名称不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "统一社会信用代码不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询企业信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCompany(queryParams.value);
  companyList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  companyFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}


/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加企业信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: CompanyVO) => {
  reset();
  const _id = row?.id
  const res = await getCompany(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改企业信息";
}

/** 提交按钮 */
const submitForm = () => {
  companyFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateCompany(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addCompany(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: CompanyVO) => {
  await proxy?.$modal.confirm('确认删除企业"' + row.name + '"？').finally(() => loading.value = false);
  await delCompany(row.id);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('im/company/export', {
    ...queryParams.value
  }, `company_${new Date().getTime()}.xlsx`)
}

const handleShowEmployee = (row: CompanyVO) => {
  employeeVisible.value = true;
  emplpyeeTitle.value = row.name + '-员工列表';
  nextTick(() => employeeRef.value.init(row));
}

onMounted(() => {
  getList();
});
</script>
