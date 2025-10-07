<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
      :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户id" prop="id">
              <el-input v-model="queryParams.id" placeholder="用户id" type="number" clearable
                @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="用户名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="queryParams.nickName" placeholder="用户昵称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="登陆IP" prop="lastLoginIp">
              <el-input v-model="queryParams.lastLoginIp" placeholder="登陆IP" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <el-button type="warning" plain icon="Download" @click="handleExport"
                v-hasPermi="['im:user:export']">导出</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
        <el-table-column label="用户id" align="center" prop="id" />
        <el-table-column label="用户名" align="center" prop="userName" />
        <el-table-column label="用户头像" align="center" prop="headImageThumb" width="100">
          <template #default="scope">
            <image-preview v-if="scope.row.headImageThumb" :src="scope.row.headImageThumb"
              :full-src="scope.row.headImage" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="用户昵称" align="center" prop="nickName" />
        <el-table-column label="性别" align="center" prop="sex">
          <template #default="scope">
            <dict-tag :options="sys_user_sex" :value="scope.row.sex" />
          </template>
        </el-table-column>
        <el-table-column label="钱包余额" align="center" prop="walletBalance" width="120">
          <template #default="scope">
            <span class="balance-text">{{ scope.row.walletBalance || 0 }} USDT</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" class="tag" type="danger">已注销</el-tag>
            <el-tag v-if="scope.row.isBanned" class="tag" type="danger">已封禁</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" align="center" prop="createdTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createdTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最后登录IP" align="center" prop="lastLoginIp" />
        <el-table-column label="最后登录时间" align="center" prop="lastLoginTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastLoginTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
          <template #default="scope">
            <el-button link type="primary" v-hasPermi="['im:user:query']"
              @click="handleDetail(scope.row)">详情</el-button>
            <el-button v-if="scope.row.isBanned" link type="danger" v-hasPermi="['im:user:ban']"
              @click="unbanHandle(scope.row)">解封</el-button>
            <el-button v-else link type="danger" v-hasPermi="['im:user:ban']"
              @click="banHandle(scope.row)">封禁</el-button>
            <el-button link type="success" icon="Wallet" v-hasPermi="['im:wallet:recharge']"
              @click="handleRecharge(scope.row)">充值</el-button>
            <el-button link type="warning" icon="List" v-hasPermi="['im:wallet:list']"
              @click="handleViewRecords(scope.row)">记录</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 充值弹窗 -->
    <UserRechargeDialog 
      v-model="rechargeDialogVisible"
      :user-info="currentUser"
      @success="handleRechargeSuccess"
    />

    <!-- 充值记录弹窗 -->
    <UserRechargeRecordsDialog 
      v-model="recordsDialogVisible"
      :user-info="currentUser"
    />

    <!-- 添加或修改用户对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <el-form ref="userFormRef" :model="form" :rules="rules" label-width="100px" disabled>
        <el-form-item label="用户头像" prop="headImage">
          <image-preview :src="form.headImageThumb" :full-src="form.headImage" :width="100" :height="100" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <dict-tag :options="sys_user_sex" :value="form.sex" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" />
        </el-form-item>
        <el-form-item v-if="form.phone" label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item v-if="form.email" label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item v-if="form.signature" label="个性签名" prop="signature">
          <el-input v-model="form.signature" />
        </el-form-item>
        <el-form-item label="最后登录时间" prop="lastLoginTime">
          <el-date-picker clearable v-model="form.lastLoginTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="注册时间" prop="createdTime">
          <el-date-picker clearable v-model="form.createdTime" type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
        </el-form-item>
        <el-form-item label="是否被封禁" prop="isBanned">
          <dict-tag :options="im_bool" :value="form.isBanned" />
        </el-form-item>
        <el-form-item v-if="form.isBanned" label="封禁原因" prop="reason">
          <el-input v-model="form.reason" />
        </el-form-item>
        <el-form-item v-if="form.cid" label="客户端id" prop="cid">
          <el-input v-model="form.cid" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User" lang="ts">
import { listUser, getUser, ban, unban } from '@/api/im/user';
import { UserVO, UserQuery, UserForm } from '@/api/im/user/types';
import UserRechargeDialog from './components/UserRechargeDialog.vue';
import UserRechargeRecordsDialog from './components/UserRechargeRecordsDialog.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userList = ref<UserVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const userFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserForm = {
  id: undefined,
  userName: undefined,
  nickName: undefined,
  headImage: undefined,
  headImageThumb: undefined,
  password: undefined,
  sex: undefined,
  phone: undefined,
  email: undefined,
  signature: undefined,
  lastLoginTime: undefined,
  createdTime: undefined,
  type: undefined,
  isBanned: undefined,
  reason: undefined,
  cid: undefined,
  status: undefined
}
const data = reactive<PageData<UserForm, UserQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    nickName: undefined,
    lastLoginIp: undefined,
    companyId: undefined,
    params: {
    }
  },
  rules: {}
});
const { queryParams, form, rules } = toRefs(data);

const { im_bool } = toRefs<any>(proxy?.useDict('im_bool'));
const { im_user_status } = toRefs<any>(proxy?.useDict('im_user_status'));
const { sys_user_sex } = toRefs<any>(proxy?.useDict('sys_user_sex'));

// 充值相关
const rechargeDialogVisible = ref(false);
const recordsDialogVisible = ref(false);
const currentUser = ref({
  userId: 0,
  userName: '',
  nickName: '',
  balance: 0
});

/** 查询用户列表 */
const getList = async () => {
  loading.value = true;
  const res = await listUser(queryParams.value);
  userList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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

/** 多选框选中数据 */
const handleSelectionChange = (selection: UserVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
  console.log("handleSelectionChange")
}

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  userFormRef.value?.resetFields();
  console.log("reset")
}

/** 修改按钮操作 */
const handleDetail = async (row?: UserVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getUser(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "用户信息";
}

/** 提交按钮 */
const submitForm = () => {
  dialog.visible = false;
}

const banHandle = (user: any) => {
  ElMessageBox.prompt('封禁原因:', '确定对该用户进行封禁？', {
    inputPattern: /\S/,
    inputErrorMessage: '请输入封禁原因',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    const data = { id: user.id, reason: value }
    ban(data).then(() => {
      user.isBanned = true
      ElMessage.success(`用户'${user.userName}'已被封禁`);
    })
  })
}

const unbanHandle = (user: any) => {
  ElMessageBox.confirm('确定解除该用户的封禁状态？？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    const data = { id: user.id }
    unban(data).then(() => {
      user.isBanned = false
      ElMessage.success(`用户'${user.userName}'解锁成功`);
    })

  })
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('im/user/export', {
    ...queryParams.value
  }, `user_${new Date().getTime()}.xlsx`)
}

/** 打开充值弹窗 */
const handleRecharge = (row: UserVO) => {
  currentUser.value = {
    userId: Number(row.id),
    userName: row.userName || '',
    nickName: row.nickName || '',
    balance: row.walletBalance || 0
  }
  rechargeDialogVisible.value = true
}

/** 充值成功回调 */
const handleRechargeSuccess = (result: any) => {
  ElMessage.success(`充值成功！订单号：${result.orderNo}`)
  // 刷新用户列表，获取最新的余额
  getList()
  // 可选：显示充值详情
  console.log('充值结果：', result)
}

/** 查看用户充值记录 */
const handleViewRecords = (row: UserVO) => {
  currentUser.value = {
    userId: Number(row.id),
    userName: row.userName || '',
    nickName: row.nickName || '',
    balance: row.walletBalance || 0
  }
  recordsDialogVisible.value = true
}

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.balance-text {
  color: #67C23A;
  font-weight: 500;
}
</style>