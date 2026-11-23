import { useEffect, useRef } from 'react';
import { MAX_HINTS, POINTS } from '../game/logic';
import { OrnamentDivider } from './Ornament';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RulesDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="rules-title"
      onClose={onClose}
      onClick={(e) => {
        // сыртқы фонды басқанда жабу
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog__body">
        <h2 id="rules-title" className="dialog__title">Ойын ережесі</h2>
        <OrnamentDivider className="ornament--small" />
        <ol className="rules">
          <li>Алаңда <b>16 сөз</b> бар. Олар мағынасына қарай <b>4 топқа</b> бөлінеді.</li>
          <li>Бір топқа жататын <b>төрт сөзді</b> таңдаңыз. Қайта басса, таңдау алынады.</li>
          <li><b>«Тексеру»</b> батырмасын басыңыз. Дұрыс болса, топ жоғарыға шығады.</li>
          <li>Қате болса — «Қайта көріңіз!» Әрекет саны артады, бірақ ойын жалғаса береді.</li>
          <li>
            Қиналсаңыз, <b>«Көмек»</b> батырмасы бір сөзді және оның мағынасын ашады.
            Бір ойында {MAX_HINTS} көмек бар.
          </li>
          <li>Төрт топтың бәрін тапқанда ойын аяқталады.</li>
        </ol>
        <div className="points">
          <span>Дұрыс топ: <b>+{POINTS.category}</b></span>
          <span>Қате: <b>{POINTS.mistake}</b></span>
          <span>Көмек: <b>{POINTS.hint}</b></span>
        </div>
        <p className="dialog__note">Абай болыңыз: кейбір сөздер бір-біріне ұқсас көрінуі мүмкін!</p>
        <button type="button" className="btn btn--primary btn--block" onClick={onClose} autoFocus>
          Түсінікті
        </button>
      </div>
    </dialog>
  );
}
