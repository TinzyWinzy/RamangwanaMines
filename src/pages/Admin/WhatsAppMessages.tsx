import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy } from '../../lib/db';
import { formatDateTime, formatDate } from '../../lib/utils';

interface WhatsAppMsg {
  id: string;
  from: string;
  fromName: string;
  messageType: string;
  text: string;
  timestamp: Date;
  direction: string;
}

export default function WhatsAppMessages() {
  const { data: messages } = useFirestoreCollection<WhatsAppMsg>('whatsappMessages', [orderBy('createdAt', 'desc')]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Messages</h1>
          <p className="text-gray-500 text-sm mt-1">{messages.length} messages received via webhook</p>
        </div>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <strong>Webhook Setup:</strong> Configure your WhatsApp Cloud API webhook URL to:{' '}
        <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">
          https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/whatsappWebhook
        </code>
        <br />Verify token: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">ramangwana_webhook_2026</code>
      </div>

      {messages.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
            <p>No WhatsApp messages received yet.</p>
            <p className="text-xs mt-2">Messages will appear here once the WhatsApp Cloud API webhook is configured and receiving messages.</p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {messages.map((msg: any) => (
          <Card key={msg.id} padding="md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{msg.fromName || msg.from}</span>
                  <span className="text-xs text-gray-400">{msg.from}</span>
                  <Badge variant={msg.direction === 'inbound' ? 'info' : 'default'}>
                    {msg.direction}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{msg.text}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{msg.messageType}</span>
                  <span>&middot;</span>
                  <span>{msg.timestamp?.toDate ? formatDateTime(msg.timestamp.toDate()) : ''}</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open(`https://wa.me/${msg.from}`, '_blank')}
              >
                Reply
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
