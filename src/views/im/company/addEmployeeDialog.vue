<template>
  <el-dialog v-model="dialogVisible" title="添加员工" width="800px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="queryParams" :inline="true">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="用户名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder="用户昵称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange" max-height="400">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户名" align="center" prop="userName" />
      <el-table-column label="头像" align="center" prop="headImageThumb" width="100">
        <template #default="scope">
          <image-preview v-if="scope.row.headImageThumb" :src="scope.row.headImageThumb" :full-src="scope.row.headImage" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center" prop="nickName" />
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :disabled="multiple" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { listUser } from '@/api/im/user';
import { UserQuery, UserVO } from '@/api/im/user/types';
import { CompanyVO, CompanyBindDTO } from '@/api/im/company/types';
import { bindEmployee } from '@/api/im/company';

defineOptions({
  name: 'AddEmployeeDialog'
});

const emit = defineEmits(['update:modelValue', 'refreshDataList']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const queryParams = ref<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  nickName: undefined,
  lastLoginIp: undefined,
  companyId: undefined,
  params: {}
});

const userList = ref<UserVO[]>([]);
const loading = ref(false);
const total = ref(0);
const multiple = ref(true);
const selectedUserIds = ref<Array<string | number>>([]);
const company = ref<CompanyVO>();
const formRef = ref();

const getList = async () => {
  loading.value = true;
  try {
    const res = await listUser(queryParams.value);
    userList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  formRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: UserVO[]) => {
  selectedUserIds.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleSubmit = async () => {
  if (!selectedUserIds.value.length) {
    ElMessage.warning('请选择要添加的员工');
    return;
  }

  const data: CompanyBindDTO = {
    id: company.value?.id,
    userIds: selectedUserIds.value
  };

  try {
    await bindEmployee(data);
    ElMessage.success('添加成功');
    dialogVisible.value = false;
    emit('refreshDataList');
  } catch (error) {
    console.error('添加员工失败', error);
  }
};

const init = (companyInfo: CompanyVO) => {
  company.value = companyInfo;
  // 排除已经是该公司的员工
  queryParams.value.companyId = 0;
  getList();
};

watch(dialogVisible, (val) => {
  if (!val) {
    // 重置
    selectedUserIds.value = [];
    multiple.value = true;
  }
});

defineExpose({
  init
});
</script>

<style scoped lang="scss"></style>
