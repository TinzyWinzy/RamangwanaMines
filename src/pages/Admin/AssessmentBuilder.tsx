import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { createDoc } from '../../lib/db';
import type { TrainingCourse } from '../../types';

interface Question {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correctAnswer: string | number;
  points: number;
}

export default function AssessmentBuilder() {
  const { data: courses } = useFirestoreCollection<TrainingCourse>('trainingCourses', []);
  const [courseId, setCourseId] = useState('');
  const [moduleNumber, setModuleNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(50);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saved, setSaved] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: 0, points: 10 }]);
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    await createDoc('trainingAssessments', {
      courseId, moduleNumber, title, passingScore, timeLimit, questions,
      createdAt: new Date(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Assessment Builder</h1>

        <Card padding="lg" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} options={courses.map((c) => ({ value: c.id, label: c.title }))} />
            <Input label="Module Number" type="number" value={moduleNumber.toString()} onChange={(e) => setModuleNumber(parseInt(e.target.value) || 1)} />
          </div>
          <Input label="Assessment Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Passing Score (%)" type="number" value={passingScore.toString()} onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)} />
            <Input label="Time Limit (minutes)" type="number" value={timeLimit.toString()} onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)} />
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Questions ({questions.length})</h3>
              <Button variant="outline" size="sm" onClick={addQuestion}>+ Add Question</Button>
            </div>

            {questions.map((q, idx) => (
              <Card key={idx} padding="md" className="mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm text-gray-900">Question {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeQuestion(idx)}>Remove</Button>
                </div>
                <Input value={q.question} onChange={(e) => updateQuestion(idx, 'question', e.target.value)} placeholder="Enter question text..." />
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Select value={q.type} onChange={(e) => updateQuestion(idx, 'type', e.target.value)} options={[
                    { value: 'multiple_choice', label: 'Multiple Choice' },
                    { value: 'true_false', label: 'True/False' },
                    { value: 'short_answer', label: 'Short Answer' },
                  ]} />
                  <Input label="Points" type="number" value={q.points.toString()} onChange={(e) => updateQuestion(idx, 'points', parseInt(e.target.value) || 0)} />
                </div>
                {(q.type === 'multiple_choice' || q.type === 'true_false') && (
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-5">{String.fromCharCode(65 + oIdx)}</span>
                        <Input value={opt} onChange={(e) => updateOption(idx, oIdx, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                        <input type="radio" name={`correct-${idx}`} checked={q.correctAnswer === oIdx} onChange={() => updateQuestion(idx, 'correctAnswer', oIdx)} title="Correct answer" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSave} disabled={!courseId || !title || questions.length === 0}>
              {saved ? 'Saved!' : 'Save Assessment'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
