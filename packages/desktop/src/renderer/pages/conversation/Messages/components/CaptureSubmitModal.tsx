/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import AionModal from '@/renderer/components/base/AionModal';
import { ipcBridge } from '@/common';
import { Button, Input, Message, Radio } from '@arco-design/web-react';
import { GoodTwo, BadTwo, EmotionUnhappy } from '@icon-park/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { recordCapture, getTodayStats, type CaptureQuality } from './captureStats';
import styles from './CaptureSubmitModal.module.css';

const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

/** 评价质量等级 */
type Quality = CaptureQuality;

/** 质量选项配置 */
const QUALITY_OPTIONS: Array<{
  value: Quality;
  labelKey: string;
  icon: React.ReactNode;
}> = [
  { value: 'good', labelKey: 'messages.captureSubmit.good', icon: <GoodTwo theme='outline' size='20' /> },
  {
    value: 'acceptable',
    labelKey: 'messages.captureSubmit.acceptable',
    icon: <EmotionUnhappy theme='outline' size='20' />,
  },
  { value: 'bad', labelKey: 'messages.captureSubmit.bad', icon: <BadTwo theme='outline' size='20' /> },
];

type CaptureSubmitModalProps = {
  /** 是否显示 */
  visible: boolean;
  /** 当前会话 ID */
  conversationId: string;
  /** 取消回调 */
  onCancel: () => void;
  /** 提交成功回调 */
  onSuccess: (quality: Quality) => void;
};

/**
 * 数据标注弹窗——调用 star CLI 的 sf/captureSubmit 扩展命令，
 * 对当前会话的 AI 回复进行质量标注。
 */
const CaptureSubmitModal: React.FC<CaptureSubmitModalProps> = ({ visible, conversationId, onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const [quality, setQuality] = useState<Quality | ''>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [todayStats, setTodayStats] = useState(() => getTodayStats());

  // 弹窗打开时刷新今日统计
  useEffect(() => {
    if (visible) setTodayStats(getTodayStats());
  }, [visible]);

  const handleCancel = () => {
    setQuality('');
    setComment('');
    onCancel();
  };

  const handleSubmit = async () => {
    if (!quality) {
      Message.warning(t('messages.captureSubmit.selectRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const params: Record<string, unknown> = { quality };
      if (comment.trim()) {
        params.comment = comment.trim();
      }
      const result = (await ipcBridge.acpConversation.extMethod.invoke({
        conversation_id: conversationId,
        method: 'sf/captureSubmit',
        params,
      })) as { success?: boolean; quality?: string; error?: string } | undefined;

      if (result?.success) {
        const updated = recordCapture(quality);
        setTodayStats(updated);
        Message.success(t('messages.captureSubmit.success'));
        setQuality('');
        setComment('');
        onSuccess(quality);
      } else {
        Message.error(result?.error || t('messages.captureSubmit.failed'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Message.error(`${t('messages.captureSubmit.failed')}: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AionModal
      variant='standard'
      visible={visible}
      onCancel={handleCancel}
      style={{ width: 420 }}
      header={{ title: t('messages.captureSubmit.title'), showClose: true }}
      footer={{
        render: () => (
          <div className='flex justify-end gap-10px'>
            <Button onClick={handleCancel}>{t('messages.captureSubmit.cancel')}</Button>
            <Button type='primary' loading={submitting} onClick={handleSubmit}>
              {t('messages.captureSubmit.submit')}
            </Button>
          </div>
        ),
      }}
    >
      <div className='flex flex-col gap-16px'>
        {todayStats.good + todayStats.acceptable + todayStats.bad > 0 && (
          <div className='flex justify-end'>
            <span className='text-12px text-t-tertiary'>
              👍{todayStats.good} 😐{todayStats.acceptable} 👎{todayStats.bad}
            </span>
          </div>
        )}
        {/* 质量等级选择 */}
        <div className='flex flex-col gap-8px'>
          <RadioGroup
            value={quality}
            onChange={(val) => setQuality(val as Quality)}
            direction='vertical'
            className={styles.radio}
          >
            {QUALITY_OPTIONS.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                <span className='inline-flex items-center gap-8px'>
                  {opt.icon}
                  {t(opt.labelKey)}
                </span>
              </Radio>
            ))}
          </RadioGroup>
        </div>

        {/* 补充说明（选填） */}
        <div className='flex flex-col gap-8px'>
          <span className='text-14px text-t-secondary'>
            {t('messages.captureSubmit.commentLabel')}
            <span className='text-t-tertiary ml-4px'>({t('messages.captureSubmit.commentOptional')})</span>
          </span>
          <TextArea
            value={comment}
            onChange={setComment}
            placeholder={t('messages.captureSubmit.commentPlaceholder')}
            maxLength={500}
            showWordLimit
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </div>
      </div>
    </AionModal>
  );
};

export default CaptureSubmitModal;
