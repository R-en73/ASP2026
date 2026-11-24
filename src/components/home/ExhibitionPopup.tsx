import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import gsap from 'gsap';

const POPUP_SESSION_KEY = 'aso-exhibition-popup-2026-dismissed';

export default function ExhibitionPopup() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(POPUP_SESSION_KEY) === 'true') return;

    const timer = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.aso-popup-overlay', { opacity: 0, duration: 0.5, ease: 'power2.out' })
        .from('.aso-popup-card', {
          y: 18,
          scale: 0.975,
          opacity: 0,
          filter: 'blur(4px)',
          duration: 0.72,
          ease: 'power2.out',
        }, '-=0.32');
    });

    return () => context.revert();
  }, [open]);

  const closePopup = () => {
    sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
    setOpen(false);
  };

  const openDetails = () => {
    closePopup();
    navigate('/schedule');
  };

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) closePopup();
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="aso-popup-overlay" />
        <Dialog.Content className="aso-popup-card" aria-describedby="aso-popup-description">
          <Dialog.Title className="sr-only">ASO高等部 卒業進級制作展2026のお知らせ</Dialog.Title>
          <Dialog.Description id="aso-popup-description" className="sr-only">
            制作展は2026年1月15日から1月20日まで開催予定です。
          </Dialog.Description>

          <img
            src={`${import.meta.env.BASE_URL}images/aso-exhibition-popup-2026.png`}
            alt="ASO高等部卒業進級制作展2026。2026年1月15日から1月20日開催。詳細はこちら。"
            className="aso-popup-image"
          />

          <Dialog.Close asChild>
            <button type="button" className="aso-popup-close" aria-label="ポップアップを閉じる" />
          </Dialog.Close>

          <button
            type="button"
            className="aso-popup-details"
            onClick={openDetails}
            aria-label="制作展の詳細を見る"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
