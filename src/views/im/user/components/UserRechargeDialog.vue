<template>
  <el-dialog v-model="dialogVisible" title="用户充值" width="550px" :close-on-click-modal="false">
    <!-- 用户信息展示 -->
    <el-descriptions :column="2" border class="mb-4">
      <el-descriptions-item label="用户ID">
        {{ userInfo.userId }}
      </el-descriptions-item>
      <el-descriptions-item label="用户名">
        {{ userInfo.userName }}
      </el-descriptions-item>
      <el-descriptions-item label="昵称">
        {{ userInfo.nickName }}
      </el-descriptions-item>
      <el-descriptions-item label="当前余额">
        <el-tag type="success">{{ userInfo.balance || 0 }} USDT</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 充值表单 -->
    <el-form ref="rechargeFormRef" :model="rechargeForm" :rules="rules" label-width="100px">
      <el-form-item label="充值金额" prop="amount">
        <el-input-number
          v-model="rechargeForm.amount"
          :min="0.01"
          :max="100000"
          :precision="2"
          :step="10"
          placeholder="请输入充值金额"
          style="width: 100%"
        >
          <template #append>USDT</template>
        </el-input-number>
        <div class="tips">单笔充值金额范围：0.01 ~ 100,000 USDT</div>
      </el-form-item>

      <el-form-item label="快捷金额">
        <el-button-group>
          <el-button @click="setAmount(10)">10</el-button>
          <el-button @click="setAmount(50)">50</el-button>
          <el-button @click="setAmount(100)">100</el-button>
          <el-button @click="setAmount(500)">500</el-button>
          <el-button @click="setAmount(1000)">1000</el-button>
        </el-button-group>
      </el-form-item>

      <el-form-item label="币种" prop="currency">
        <el-input v-model="rechargeForm.currency" disabled style="width: 100%" />
      </el-form-item>

      <el-form-item label="充值备注" prop="remark">
        <el-input v-model="rechargeForm.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入充值备注（选填）">
        </el-input>
      </el-form-item>

      <!-- 预览充值信息 -->
      <el-alert v-if="rechargeForm.amount > 0" type="info" :closable="false" class="mb-3">
        <template #title>
          <div class="recharge-preview">
            <div>
              充值后余额：
              <strong class="text-success">
                {{ (parseFloat(String(userInfo.balance || 0)) + parseFloat(String(rechargeForm.amount || 0))).toFixed(2) }}
                {{ rechargeForm.currency }}
              </strong>
            </div>
          </div>
        </template>
      </el-alert>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit"> 确认充值 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { rechargeForUser } from '@/api/im/wallet';
import type { AdminRechargeDTO } from '@/api/im/wallet/types';

defineOptions({
  name: 'UserRechargeDialog'
});

// Props
interface Props {
  modelValue: boolean;
  userInfo: {
    userId: number;
    userName: string;
    nickName: string;
    balance: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  userInfo: () => ({
    userId: 0,
    userName: '',
    nickName: '',
    balance: 0
  })
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [result: any];
}>();

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 表单引用
const rechargeFormRef = ref<ElFormInstance>();
const loading = ref(false);

// 充值表单
const rechargeForm = reactive({
  amount: 0,
  currency: 'USDT',
  remark: ''
});

// 表单校验规则
const rules: ElFormRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    {
      type: 'number',
      min: 0.01,
      max: 100000,
      message: '充值金额必须在 0.01 ~ 100,000 之间',
      trigger: 'blur'
    }
  ],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  remark: [{ max: 200, message: '备注长度不能超过200字符', trigger: 'blur' }]
};

// 快捷设置金额
const setAmount = (amount: number) => {
  rechargeForm.amount = amount;
};

// 提交充值
const handleSubmit = async () => {
  if (!rechargeFormRef.value) return;

  await rechargeFormRef.value.validate(async (valid) => {
    if (!valid) return;

    // 二次确认
    try {
      await ElMessageBox.confirm(`确认为用户【${props.userInfo.nickName}】充值 ${rechargeForm.amount} ${rechargeForm.currency}？`, '充值确认', {
        confirmButtonText: '确认充值',
        cancelButtonText: '取消',
        type: 'warning'
      });

      loading.value = true;

      // 调用充值接口
      const params: AdminRechargeDTO = {
        userId: props.userInfo.userId,
        amount: rechargeForm.amount,
        currency: rechargeForm.currency,
        remark: rechargeForm.remark
      };

      const res = await rechargeForUser(params);

      // 关闭弹窗
      dialogVisible.value = false;

      // 通知父组件刷新（由父组件显示成功消息）
      emit('success', res.data);

      // 重置表单
      resetForm();
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('充值失败', error);
      }
    } finally {
      loading.value = false;
    }
  });
};

// 重置表单
const resetForm = () => {
  rechargeForm.amount = 0;
  rechargeForm.currency = 'USDT';
  rechargeForm.remark = '';
  rechargeFormRef.value?.resetFields();
};

// 监听弹窗打开，重置表单
watch(dialogVisible, (val) => {
  if (val) {
    resetForm();
  }
});
</script>

<style scoped lang="scss">
.tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.recharge-preview {
  font-size: 14px;

  .text-success {
    color: #67c23a;
    font-size: 16px;
  }
}

.mb-3 {
  margin-bottom: 15px;
}

.mb-4 {
  margin-bottom: 20px;
}
</style>
